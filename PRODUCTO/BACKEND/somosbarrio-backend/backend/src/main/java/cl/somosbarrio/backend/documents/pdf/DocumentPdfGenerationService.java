package cl.somosbarrio.backend.documents.pdf;

import cl.somosbarrio.backend.documents.entity.DocumentEntity;

/**
 * Genera el PDF institucional del documento y devuelve la ruta relativa bajo {@code UPLOAD_ROOT}.
 */
public interface DocumentPdfGenerationService {

    /**
     * Merge de plantilla .docx + export PDF (LibreOffice si existe; si no, PDF resumen OpenPDF).
     */
    String generateAndStorePdf(DocumentEntity document);

    /**
     * Solo merge .docx (borrador / revisión); guarda en {@code documents/previews/{id}/} con nombre
     * {@link GeneratedDocumentFilenames#previewMergedDocxFileName}.
     */
    String mergePreviewDocx(DocumentEntity document);
}
