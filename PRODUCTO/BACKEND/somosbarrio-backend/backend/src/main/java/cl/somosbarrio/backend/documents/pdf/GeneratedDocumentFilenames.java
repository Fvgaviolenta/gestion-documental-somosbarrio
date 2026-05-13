package cl.somosbarrio.backend.documents.pdf;

import cl.somosbarrio.backend.documents.dto.DocumentDto;
import cl.somosbarrio.backend.documents.entity.DocumentEntity;
import cl.somosbarrio.backend.documents.entity.DocumentType;

import java.util.UUID;

/**
 * Nombres de archivo para PDF y .docx mergeados: {@code {TIPO}_{código_correlativo}} (ej. {@code ACTA_ACT-2026-0001.pdf}).
 */
public final class GeneratedDocumentFilenames {

    private GeneratedDocumentFilenames() {
    }

    public static String stem(DocumentEntity document) {
        DocumentType type = document.getTemplate() != null ? document.getTemplate().getDocumentType() : null;
        return stem(type, document.getCode(), document.getId());
    }

    public static String stem(DocumentDto dto) {
        return stem(dto.getDocumentType(), dto.getCode(), dto.getId());
    }

    public static String mergedDocxFileName(DocumentEntity document) {
        return stem(document) + "_merged.docx";
    }

    public static String pdfFileName(DocumentEntity document) {
        return stem(document) + ".pdf";
    }

    public static String previewMergedDocxFileName(DocumentEntity document) {
        return stem(document) + "_preview_merged.docx";
    }

    static String stem(DocumentType type, String code, UUID id) {
        String typePart = type != null ? type.name() : "DOC";
        String codePart = (code != null && !code.isBlank()) ? code : id.toString();
        return typePart + "_" + sanitize(codePart);
    }

    static String sanitize(String s) {
        String t = s.replaceAll("[\\\\/:*?\"<>|]", "_");
        t = t.replaceAll("\\s+", "_");
        return t.isBlank() ? "documento" : t;
    }
}
