package cl.somosbarrio.backend.documents.pdf;

import cl.somosbarrio.backend.documents.entity.DocumentEntity;
import cl.somosbarrio.backend.documents.entity.DocumentTemplateEntity;
import cl.somosbarrio.backend.documents.entity.DocumentType;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class GeneratedDocumentFilenamesTest {

    @Test
    void stemUsesTypeAndCorrelativeCode() {
        DocumentTemplateEntity tpl = new DocumentTemplateEntity();
        tpl.setDocumentType(DocumentType.ACTA);
        DocumentEntity doc = new DocumentEntity();
        doc.setId(UUID.fromString("11111111-1111-1111-1111-111111111111"));
        doc.setCode("ACT-2026-0042");
        doc.setTemplate(tpl);

        assertThat(GeneratedDocumentFilenames.stem(doc)).isEqualTo("ACTA_ACT-2026-0042");
        assertThat(GeneratedDocumentFilenames.pdfFileName(doc)).isEqualTo("ACTA_ACT-2026-0042.pdf");
        assertThat(GeneratedDocumentFilenames.mergedDocxFileName(doc)).isEqualTo("ACTA_ACT-2026-0042_merged.docx");
        assertThat(GeneratedDocumentFilenames.previewMergedDocxFileName(doc))
                .isEqualTo("ACTA_ACT-2026-0042_preview_merged.docx");
    }

    @Test
    void sanitizesIllegalPathCharactersInCode() {
        DocumentTemplateEntity tpl = new DocumentTemplateEntity();
        tpl.setDocumentType(DocumentType.INFORME);
        DocumentEntity doc = new DocumentEntity();
        doc.setId(UUID.fromString("22222222-2222-2222-2222-222222222222"));
        doc.setCode("INF:2026/X");
        doc.setTemplate(tpl);

        assertThat(GeneratedDocumentFilenames.stem(doc)).isEqualTo("INFORME_INF_2026_X");
    }
}
