package cl.somosbarrio.backend.reports.service;

import cl.somosbarrio.backend.activities.entity.ActivityEntity;
import cl.somosbarrio.backend.activities.repository.ActivityRepository;
import cl.somosbarrio.backend.documents.entity.DocumentEntity;
import cl.somosbarrio.backend.documents.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportServiceImpl implements ReportService {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter DATETIME_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    private final DocumentRepository documentRepository;
    private final ActivityRepository activityRepository;

    // -------------------------------------------------------------------------
    // Reporte documentos
    // -------------------------------------------------------------------------

    @Override
    @Transactional(readOnly = true)
    public byte[] generateDocumentsExcel(LocalDate from, LocalDate to) {
        Specification<DocumentEntity> spec = (root, query, cb) ->
                cb.between(root.get("createdAt"),
                        from.atStartOfDay().toInstant(ZoneOffset.UTC),
                        to.plusDays(1).atStartOfDay().toInstant(ZoneOffset.UTC));

        List<DocumentEntity> docs = documentRepository.findAll(spec);

        try (XSSFWorkbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Documentos");
            CellStyle headerStyle = buildHeaderStyle(workbook);

            // Cabecera
            String[] headers = {
                "Código", "Título", "Tipo", "Estado",
                "Actividad", "Creado por", "Fecha creación", "Fecha aprobación"
            };
            buildHeaderRow(sheet, headers, headerStyle);

            // Filas de datos
            int rowIdx = 1;
            for (DocumentEntity doc : docs) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(doc.getCode());
                row.createCell(1).setCellValue(doc.getTitle());
                row.createCell(2).setCellValue(doc.getTemplate() != null
                        ? doc.getTemplate().getDocumentType().name() : "");
                row.createCell(3).setCellValue(doc.getStatus().name());
                row.createCell(4).setCellValue(doc.getActivity() != null
                        ? doc.getActivity().getTitle() : "—");
                row.createCell(5).setCellValue(doc.getCreatedBy() != null
                        ? fullName(doc.getCreatedBy().getFirstName(), doc.getCreatedBy().getLastName()) : "");
                row.createCell(6).setCellValue(doc.getCreatedAt() != null
                        ? DATETIME_FMT.format(doc.getCreatedAt().atZone(ZoneOffset.UTC)) : "");
                row.createCell(7).setCellValue(doc.getApprovedAt() != null
                        ? DATETIME_FMT.format(doc.getApprovedAt().atZone(ZoneOffset.UTC)) : "—");
            }

            autosizeColumns(sheet, headers.length);
            return toBytes(workbook);
        } catch (IOException e) {
            log.error("Error generando reporte Excel de documentos: {}", e.getMessage());
            throw new RuntimeException("No se pudo generar el reporte de documentos", e);
        }
    }

    // -------------------------------------------------------------------------
    // Reporte actividades
    // -------------------------------------------------------------------------

    @Override
    @Transactional(readOnly = true)
    public byte[] generateActivitiesExcel(int year, int month) {
        LocalDate firstDay = LocalDate.of(year, month, 1);
        LocalDate lastDay = firstDay.withDayOfMonth(firstDay.lengthOfMonth());

        Specification<ActivityEntity> spec = (root, query, cb) ->
                cb.between(root.get("startDate"), firstDay, lastDay);

        List<ActivityEntity> activities = activityRepository.findAll(spec);

        try (XSSFWorkbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Actividades");
            CellStyle headerStyle = buildHeaderStyle(workbook);

            String[] headers = {
                "Título", "Territorio", "Estado",
                "Fecha inicio", "Fecha fin", "Creado por"
            };
            buildHeaderRow(sheet, headers, headerStyle);

            int rowIdx = 1;
            for (ActivityEntity act : activities) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(act.getTitle());
                row.createCell(1).setCellValue(act.getTerritory());
                row.createCell(2).setCellValue(act.getStatus().name());
                row.createCell(3).setCellValue(act.getStartDate() != null
                        ? DATE_FMT.format(act.getStartDate()) : "");
                row.createCell(4).setCellValue(act.getEndDate() != null
                        ? DATE_FMT.format(act.getEndDate()) : "—");
                row.createCell(5).setCellValue(act.getCreatedBy() != null
                        ? fullName(act.getCreatedBy().getFirstName(), act.getCreatedBy().getLastName()) : "");
            }

            autosizeColumns(sheet, headers.length);
            return toBytes(workbook);
        } catch (IOException e) {
            log.error("Error generando reporte Excel de actividades: {}", e.getMessage());
            throw new RuntimeException("No se pudo generar el reporte de actividades", e);
        }
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private CellStyle buildHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setBorderBottom(BorderStyle.THIN);
        return style;
    }

    private void buildHeaderRow(Sheet sheet, String[] headers, CellStyle style) {
        Row row = sheet.createRow(0);
        for (int i = 0; i < headers.length; i++) {
            Cell cell = row.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(style);
        }
    }

    private void autosizeColumns(Sheet sheet, int count) {
        for (int i = 0; i < count; i++) {
            sheet.autoSizeColumn(i);
            // Añade un mínimo de ancho para columnas muy estrechas
            if (sheet.getColumnWidth(i) < 3000) {
                sheet.setColumnWidth(i, 3000);
            }
        }
    }

    private byte[] toBytes(XSSFWorkbook workbook) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        workbook.write(baos);
        return baos.toByteArray();
    }

    private String fullName(String firstName, String lastName) {
        return (firstName != null ? firstName : "") + " " + (lastName != null ? lastName : "");
    }
}
