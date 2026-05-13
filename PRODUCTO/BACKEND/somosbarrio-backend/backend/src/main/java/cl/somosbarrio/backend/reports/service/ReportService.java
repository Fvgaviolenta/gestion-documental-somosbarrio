package cl.somosbarrio.backend.reports.service;

import java.time.LocalDate;

public interface ReportService {

    /**
     * Genera un Excel (.xlsx) con todos los documentos cuya fecha de creación
     * esté dentro del rango [from, to] (ambos inclusive).
     */
    byte[] generateDocumentsExcel(LocalDate from, LocalDate to);

    /**
     * Genera un Excel (.xlsx) con todas las actividades cuya fecha de inicio
     * (start_date) esté dentro del mes y año indicados.
     */
    byte[] generateActivitiesExcel(int year, int month);
}
