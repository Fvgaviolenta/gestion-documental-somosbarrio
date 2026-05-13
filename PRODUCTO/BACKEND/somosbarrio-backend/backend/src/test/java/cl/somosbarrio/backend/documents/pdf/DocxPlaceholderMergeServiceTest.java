package cl.somosbarrio.backend.documents.pdf;

import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.apache.poi.xwpf.usermodel.XWPFTable;
import org.apache.poi.xwpf.usermodel.XWPFTableCell;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class DocxPlaceholderMergeServiceTest {

    private final DocxPlaceholderMergeService service = new DocxPlaceholderMergeService();

    @Test
    void replacesTextPlaceholderInParagraph() throws Exception {
        try (XWPFDocument doc = new XWPFDocument()) {
            XWPFParagraph p = doc.createParagraph();
            p.createRun().setText("Hola ${nombre}");

            service.merge(doc, Map.of("nombre", "Mundo"), Map.of());

            ByteArrayOutputStream bos = new ByteArrayOutputStream();
            doc.write(bos);
            try (XWPFDocument readBack = new XWPFDocument(new ByteArrayInputStream(bos.toByteArray()))) {
                assertThat(readBack.getParagraphs().get(0).getText()).isEqualTo("Hola Mundo");
            }
        }
    }

    @Test
    void replacesPlaceholderSplitAcrossRuns() throws Exception {
        try (XWPFDocument doc = new XWPFDocument()) {
            XWPFParagraph p = doc.createParagraph();
            p.createRun().setText("Hola ${nom");
            p.createRun().setText("bre}");

            service.merge(doc, Map.of("nombre", "Mundo"), Map.of());

            ByteArrayOutputStream bos = new ByteArrayOutputStream();
            doc.write(bos);
            try (XWPFDocument readBack = new XWPFDocument(new ByteArrayInputStream(bos.toByteArray()))) {
                assertThat(readBack.getParagraphs().get(0).getText()).isEqualTo("Hola Mundo");
            }
        }
    }

    @Test
    void replacesPlaceholderSplitAcrossRunsInsideTableCell() throws Exception {
        try (XWPFDocument doc = new XWPFDocument()) {
            XWPFTable table = doc.createTable(1, 2);
            XWPFTableCell cell = table.getRow(0).getCell(1);
            cell.removeParagraph(0);
            XWPFParagraph p = cell.addParagraph();
            p.createRun().setText("${nom");
            p.createRun().setText("bre}");

            service.merge(doc, Map.of("nombre", "Valor"), Map.of());

            ByteArrayOutputStream bos = new ByteArrayOutputStream();
            doc.write(bos);
            try (XWPFDocument readBack = new XWPFDocument(new ByteArrayInputStream(bos.toByteArray()))) {
                XWPFParagraph rp = readBack.getTables().get(0).getRow(0).getCell(1).getParagraphArray(0);
                assertThat(rp.getText()).isEqualTo("Valor");
            }
        }
    }

    @Test
    void imgPlaceholderByUuidShowsUnavailableWhenFileMissing() throws Exception {
        UUID id = UUID.fromString("a0000000-0000-0000-0000-000000000099");
        try (XWPFDocument doc = new XWPFDocument()) {
            XWPFParagraph p = doc.createParagraph();
            p.createRun().setText("${IMG:" + id + "}");
            service.merge(doc, Map.of(), Map.of());
            assertThat(doc.getParagraphs().get(0).getText()).contains("imagen no disponible");
        }
    }

    @Test
    void imgPlaceholderByFieldKeyUsesUuidFromFieldValues() throws Exception {
        UUID id = UUID.fromString("b0000000-0000-0000-0000-000000000099");
        try (XWPFDocument doc = new XWPFDocument()) {
            XWPFParagraph p = doc.createParagraph();
            p.createRun().setText("${IMG:foto_mesa_uuid}");
            service.merge(doc, Map.of("foto_mesa_uuid", id.toString()), Map.of());
            assertThat(doc.getParagraphs().get(0).getText()).contains("imagen no disponible");
        }
    }

    @Test
    void imgPlaceholderByFieldKeyEmptyShowsHint() throws Exception {
        try (XWPFDocument doc = new XWPFDocument()) {
            XWPFParagraph p = doc.createParagraph();
            p.createRun().setText("${IMG:foto_mesa_uuid}");
            service.merge(doc, Map.of(), Map.of());
            assertThat(doc.getParagraphs().get(0).getText()).contains("sin UUID");
        }
    }
}
