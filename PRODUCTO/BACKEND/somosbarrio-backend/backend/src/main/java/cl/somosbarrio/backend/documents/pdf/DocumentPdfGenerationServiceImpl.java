package cl.somosbarrio.backend.documents.pdf;

import cl.somosbarrio.backend.documents.entity.DocumentAttachmentEntity;
import cl.somosbarrio.backend.documents.entity.DocumentEntity;
import cl.somosbarrio.backend.documents.repository.DocumentAttachmentRepository;
import cl.somosbarrio.backend.common.storage.FileStorageService;
import cl.somosbarrio.backend.exception.ErrorCode;
import cl.somosbarrio.backend.exception.custom.BusinessException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.openxml4j.opc.OPCPackage;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class DocumentPdfGenerationServiceImpl implements DocumentPdfGenerationService {

    private final TemplateRootResolver templateRootResolver;
    private final DocxPlaceholderMergeService docxPlaceholderMergeService;
    private final LibreOfficePdfConverter libreOfficePdfConverter;
    private final OpenPdfFallbackGenerator openPdfFallbackGenerator;
    private final DocumentAttachmentRepository attachmentRepository;
    private final FileStorageService fileStorageService;
    private final ObjectMapper objectMapper;

    @Override
    public String mergePreviewDocx(DocumentEntity document) {
        Path templatePath = resolveTemplateFile(document);
        Map<String, String> vars = JsonFieldFlattener.flatten(document.getFieldValues(), objectMapper);
        Map<UUID, Path> imagePaths = loadImageAttachments(document.getId());

        String relativeDir = "documents/previews/" + document.getId();
        String mergedName = GeneratedDocumentFilenames.previewMergedDocxFileName(document);
        Path mergedDocx = fileStorageService.resolve(relativeDir).resolve(mergedName);
        writeMergedDocx(templatePath, vars, imagePaths, mergedDocx);
        return relativeDir + "/" + mergedName;
    }

    @Override
    public String generateAndStorePdf(DocumentEntity document) {
        Path templatePath = resolveTemplateFile(document);
        Map<String, String> vars = JsonFieldFlattener.flatten(document.getFieldValues(), objectMapper);
        Map<UUID, Path> imagePaths = loadImageAttachments(document.getId());

        String typeFolder = document.getTemplate().getDocumentType().name();
        String relativeDir = "documents/generated/" + typeFolder + "/" + document.getId();
        Path genDir = fileStorageService.resolve(relativeDir);
        try {
            Files.createDirectories(genDir);
        } catch (Exception e) {
            throw new BusinessException(ErrorCode.FILE_STORAGE_ERROR,
                    "No se pudo crear carpeta de generados", HttpStatus.INTERNAL_SERVER_ERROR);
        }

        String mergedName = GeneratedDocumentFilenames.mergedDocxFileName(document);
        String pdfName = GeneratedDocumentFilenames.pdfFileName(document);
        Path mergedDocx = genDir.resolve(mergedName);
        Path pdfOut = genDir.resolve(pdfName);

        writeMergedDocx(templatePath, vars, imagePaths, mergedDocx);

        try {
            if (libreOfficePdfConverter.isAvailable()) {
                libreOfficePdfConverter.convert(mergedDocx, pdfOut);
            } else {
                openPdfFallbackGenerator.write(document, vars, imagePaths, pdfOut);
                log.warn("PDF documento {} generado en modo resumen (sin LibreOffice).", document.getId());
            }
        } catch (Exception ex) {
            log.error("Fallo export PDF documento {}: {}", document.getId(), ex.getMessage(), ex);
            throw new BusinessException(ErrorCode.FILE_STORAGE_ERROR,
                    "No se pudo generar el PDF: " + ex.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return relativeDir + "/" + pdfName;
    }

    private Path resolveTemplateFile(DocumentEntity document) {
        String relTemplate = document.getTemplate().getTemplateFilePath();
        if (relTemplate == null || relTemplate.isBlank()) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR,
                    "La plantilla no tiene template_file_path (.docx bajo TEMPLATE_ROOT). "
                            + "Configúrelo en la plantilla antes de aprobar.",
                    HttpStatus.BAD_REQUEST);
        }

        Path templatePath = templateRootResolver.resolveRelative(relTemplate);
        if (!Files.isRegularFile(templatePath)) {
            throw new BusinessException(ErrorCode.FILE_STORAGE_ERROR,
                    "No existe el archivo de plantilla: " + templatePath,
                    HttpStatus.CONFLICT);
        }
        return templatePath;
    }

    private void writeMergedDocx(Path templatePath, Map<String, String> vars,
                                 Map<UUID, Path> imagePaths, Path mergedDocxOut) {
        try {
            Files.createDirectories(mergedDocxOut.getParent());
        } catch (Exception e) {
            throw new BusinessException(ErrorCode.FILE_STORAGE_ERROR,
                    "No se pudo crear carpeta de salida", HttpStatus.INTERNAL_SERVER_ERROR);
        }

        try (InputStream in = Files.newInputStream(templatePath);
             OPCPackage pkg = OPCPackage.open(in);
             XWPFDocument docx = new XWPFDocument(pkg)) {
            docxPlaceholderMergeService.merge(docx, vars, imagePaths);
            try (var out = Files.newOutputStream(mergedDocxOut)) {
                docx.write(out);
            }
        } catch (Exception ex) {
            log.error("Fallo merge docx: {}", ex.getMessage(), ex);
            throw new BusinessException(ErrorCode.FILE_STORAGE_ERROR,
                    "No se pudo completar la plantilla Word: " + ex.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private Map<UUID, Path> loadImageAttachments(UUID documentId) {
        Map<UUID, Path> map = new LinkedHashMap<>();
        for (DocumentAttachmentEntity a : attachmentRepository.findByDocumentId(documentId)) {
            String ct = a.getContentType();
            if (ct != null && ct.startsWith("image/")) {
                map.put(a.getId(), fileStorageService.resolve(a.getStoredFilename()));
            }
        }
        return map;
    }
}
