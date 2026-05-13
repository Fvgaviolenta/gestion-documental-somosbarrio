package cl.somosbarrio.backend.documents.pdf;

import cl.somosbarrio.backend.documents.entity.DocumentEntity;
import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Image;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;
import java.util.UUID;

/**
 * PDF de respaldo cuando LibreOffice no está instalado: resume campos e incrusta imágenes de adjuntos.
 * No replica el layout Word institucional.
 */
@Service
public class OpenPdfFallbackGenerator {

    public void write(DocumentEntity document, Map<String, String> vars,
                      Map<UUID, Path> imageByAttachmentId, Path outputPdf) throws Exception {
        Document pdf = new Document(PageSize.A4, 50, 50, 50, 50);
        PdfWriter.getInstance(pdf, Files.newOutputStream(outputPdf));
        pdf.open();

        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16);
        Font bodyFont = FontFactory.getFont(FontFactory.HELVETICA, 11);

        pdf.add(new Paragraph("Documento Somos Barrio (vista resumen)", titleFont));
        pdf.add(new Paragraph("Código: " + document.getCode(), bodyFont));
        pdf.add(new Paragraph("Título: " + document.getTitle(), bodyFont));
        pdf.add(new Paragraph(" ", bodyFont));
        pdf.add(new Paragraph(
                "Este PDF se generó sin LibreOffice: es una vista administrativa de los datos capturados. "
                        + "Para fidelidad respecto a la plantilla Word, configure app.documents.libreoffice-path.",
                FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 9)));
        pdf.add(new Paragraph(" ", bodyFont));

        if (!vars.isEmpty()) {
            PdfPTable table = new PdfPTable(2);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{1.2f, 3f});
            for (Map.Entry<String, String> e : vars.entrySet()) {
                table.addCell(cell(e.getKey(), true));
                table.addCell(cell(e.getValue() != null ? e.getValue() : "", false));
            }
            pdf.add(table);
        }

        if (!imageByAttachmentId.isEmpty()) {
            pdf.add(new Paragraph(" ", bodyFont));
            pdf.add(new Paragraph("Imágenes adjuntas", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12)));
            for (Map.Entry<UUID, Path> e : imageByAttachmentId.entrySet()) {
                Path path = e.getValue();
                if (!Files.isRegularFile(path)) {
                    continue;
                }
                pdf.add(new Paragraph("Adjunto " + e.getKey(), bodyFont));
                Image img = Image.getInstance(path.toAbsolutePath().toString());
                img.scaleToFit(PageSize.A4.getWidth() - 100, PageSize.A4.getHeight() / 2);
                img.setAlignment(Element.ALIGN_CENTER);
                pdf.add(img);
                pdf.add(new Paragraph(" ", bodyFont));
            }
        }

        pdf.close();
    }

    private static PdfPCell cell(String text, boolean header) {
        PdfPCell c = new PdfPCell(new Paragraph(text,
                FontFactory.getFont(FontFactory.HELVETICA, header ? 10 : 10,
                        header ? Font.BOLD : Font.NORMAL)));
        c.setPadding(4);
        return c;
    }
}
