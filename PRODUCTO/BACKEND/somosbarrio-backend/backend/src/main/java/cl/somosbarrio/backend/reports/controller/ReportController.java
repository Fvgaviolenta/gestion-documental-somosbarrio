package cl.somosbarrio.backend.reports.controller;

import cl.somosbarrio.backend.reports.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMINISTRADOR')")
public class ReportController {

    private static final MediaType XLSX =
            MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

    private final ReportService reportService;

    /**
     * GET /api/v1/reports/documents?from=2026-01-01&to=2026-05-31
     * Descarga un Excel con los documentos creados en el rango indicado.
     */
    @GetMapping("/documents")
    public ResponseEntity<byte[]> documentsReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {

        byte[] bytes = reportService.generateDocumentsExcel(from, to);
        String filename = "reporte_documentos_" + from + "_" + to + ".xlsx";

        return ResponseEntity.ok()
                .contentType(XLSX)
                .headers(attachmentHeaders(filename))
                .body(bytes);
    }

    /**
     * GET /api/v1/reports/activities?year=2026&month=5
     * Descarga un Excel con las actividades del mes indicado.
     */
    @GetMapping("/activities")
    public ResponseEntity<byte[]> activitiesReport(
            @RequestParam int year,
            @RequestParam int month) {

        byte[] bytes = reportService.generateActivitiesExcel(year, month);
        String filename = String.format("reporte_actividades_%d_%02d.xlsx", year, month);

        return ResponseEntity.ok()
                .contentType(XLSX)
                .headers(attachmentHeaders(filename))
                .body(bytes);
    }

    private HttpHeaders attachmentHeaders(String filename) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentDisposition(
                ContentDisposition.attachment().filename(filename).build());
        return headers;
    }
}
