package cl.somosbarrio.backend.documents.pdf;

import lombok.extern.slf4j.Slf4j;
import org.apache.poi.util.Units;
import org.apache.poi.xwpf.usermodel.IBodyElement;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFHeader;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.apache.poi.xwpf.usermodel.XWPFRun;
import org.apache.poi.xwpf.usermodel.XWPFTable;
import org.apache.poi.xwpf.usermodel.XWPFTableCell;
import org.apache.poi.xwpf.usermodel.XWPFTableRow;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Reemplaza {@code ${campo}} por texto y párrafos que contienen solo un marcador de imagen:
 * {@code ${IMG:<uuid>}} (adjunto por id) o {@code ${IMG:nombreCampo}} si {@code nombreCampo} está en
 * {@code field_values} con un UUID de adjunto ya subido.
 */
@Service
@Slf4j
public class DocxPlaceholderMergeService {

    /** Solo párrafo con UUID literal del adjunto. */
    private static final Pattern IMG_UUID_LITERAL = Pattern.compile(
            "^\\$\\{IMG:([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})\\}\\s*$");

    /** Solo párrafo: nombre de clave en field_values cuyo valor debe ser el UUID del adjunto. */
    private static final Pattern IMG_FIELD_REF = Pattern.compile("^\\$\\{IMG:([a-zA-Z_][a-zA-Z0-9_]*)\\}\\s*$");

    public void merge(XWPFDocument document, Map<String, String> textVars, Map<UUID, Path> imageByAttachmentId) {
        for (IBodyElement el : document.getBodyElements()) {
            if (el instanceof XWPFParagraph p) {
                processParagraph(document, p, textVars, imageByAttachmentId);
            } else if (el instanceof XWPFTable t) {
                processTable(document, t, textVars, imageByAttachmentId);
            }
        }
        if (document.getHeaderList() != null) {
            for (XWPFHeader header : document.getHeaderList()) {
                for (IBodyElement el : header.getBodyElements()) {
                    if (el instanceof XWPFParagraph p) {
                        processParagraph(document, p, textVars, imageByAttachmentId);
                    } else if (el instanceof XWPFTable t) {
                        processTable(document, t, textVars, imageByAttachmentId);
                    }
                }
            }
        }
        if (document.getFooterList() != null) {
            for (var footer : document.getFooterList()) {
                for (IBodyElement el : footer.getBodyElements()) {
                    if (el instanceof XWPFParagraph p) {
                        processParagraph(document, p, textVars, imageByAttachmentId);
                    } else if (el instanceof XWPFTable t) {
                        processTable(document, t, textVars, imageByAttachmentId);
                    }
                }
            }
        }
    }

    private void processTable(XWPFDocument document, XWPFTable table,
                              Map<String, String> textVars, Map<UUID, Path> imageByAttachmentId) {
        for (XWPFTableRow row : table.getRows()) {
            for (XWPFTableCell cell : row.getTableCells()) {
                for (XWPFParagraph p : cell.getParagraphs()) {
                    processParagraph(document, p, textVars, imageByAttachmentId);
                }
                for (XWPFTable nested : cell.getTables()) {
                    processTable(document, nested, textVars, imageByAttachmentId);
                }
            }
        }
    }

    private void processParagraph(XWPFDocument document, XWPFParagraph paragraph,
                                  Map<String, String> textVars, Map<UUID, Path> imageByAttachmentId) {
        String fullText = paragraph.getText();
        if (fullText == null) {
            fullText = "";
        }
        String trimmed = fullText.trim();
        Matcher imgLit = IMG_UUID_LITERAL.matcher(trimmed);
        if (imgLit.matches()) {
            UUID attId = UUID.fromString(imgLit.group(1));
            insertImageOrPlaceholder(document, paragraph, attId, imageByAttachmentId);
            return;
        }
        Matcher imgField = IMG_FIELD_REF.matcher(trimmed);
        if (imgField.matches()) {
            String fieldKey = imgField.group(1);
            String raw = textVars.get(fieldKey);
            clearParagraphRuns(paragraph);
            if (raw == null || raw.isBlank()) {
                XWPFRun run = paragraph.createRun();
                run.setText("[sin UUID de adjunto en campo: " + fieldKey + "]");
                return;
            }
            try {
                UUID attId = UUID.fromString(raw.trim());
                insertImageOrPlaceholder(document, paragraph, attId, imageByAttachmentId);
            } catch (IllegalArgumentException ex) {
                XWPFRun run = paragraph.createRun();
                run.setText("[UUID inválido en campo " + fieldKey + "]");
            }
            return;
        }
        String replaced = replaceTextPlaceholders(fullText, textVars);
        if (!replaced.equals(fullText)) {
            clearParagraphRuns(paragraph);
            XWPFRun run = paragraph.createRun();
            run.setText(replaced);
        }
    }

    private void insertImageOrPlaceholder(XWPFDocument document, XWPFParagraph paragraph, UUID attId,
                                          Map<UUID, Path> imageByAttachmentId) {
        clearParagraphRuns(paragraph);
        Path imgPath = imageByAttachmentId.get(attId);
        if (imgPath != null && Files.isRegularFile(imgPath)) {
            insertPicture(document, paragraph, imgPath);
        } else {
            XWPFRun run = paragraph.createRun();
            run.setText("[imagen no disponible: " + attId + "]");
        }
    }

    private static String replaceTextPlaceholders(String text, Map<String, String> textVars) {
        String result = text;
        for (Map.Entry<String, String> e : textVars.entrySet()) {
            String ph = "${" + e.getKey() + "}";
            if (result.contains(ph)) {
                result = result.replace(ph, e.getValue() != null ? e.getValue() : "");
            }
        }
        return result;
    }

    private static void clearParagraphRuns(XWPFParagraph paragraph) {
        List<XWPFRun> runs = paragraph.getRuns();
        for (int i = runs.size() - 1; i >= 0; i--) {
            paragraph.removeRun(i);
        }
    }

    private void insertPicture(XWPFDocument document, XWPFParagraph paragraph, Path imgPath) {
        String fileName = imgPath.getFileName().toString().toLowerCase();
        int pictureType = fileName.endsWith(".png")
                ? XWPFDocument.PICTURE_TYPE_PNG
                : XWPFDocument.PICTURE_TYPE_JPEG;
        try {
            int widthEmu;
            int heightEmu;
            try (InputStream is = Files.newInputStream(imgPath)) {
                BufferedImage bi = ImageIO.read(is);
                if (bi == null) {
                    XWPFRun run = paragraph.createRun();
                    run.setText("[formato de imagen no soportado]");
                    return;
                }
                int wPx = bi.getWidth();
                int hPx = bi.getHeight();
                int maxWidthEmu = Units.toEMU(400);
                widthEmu = Units.pixelToEMU(Math.min(wPx, 600));
                heightEmu = Units.pixelToEMU(hPx);
                if (widthEmu > maxWidthEmu) {
                    double scale = (double) maxWidthEmu / widthEmu;
                    widthEmu = maxWidthEmu;
                    heightEmu = (int) Math.round(heightEmu * scale);
                }
            }
            try (InputStream is = Files.newInputStream(imgPath)) {
                XWPFRun run = paragraph.createRun();
                run.addPicture(is, pictureType, imgPath.getFileName().toString(), widthEmu, heightEmu);
            }
        } catch (Exception ex) {
            log.warn("No se pudo insertar imagen {}: {}", imgPath, ex.getMessage());
            XWPFRun run = paragraph.createRun();
            run.setText("[error al leer imagen]");
        }
    }
}
