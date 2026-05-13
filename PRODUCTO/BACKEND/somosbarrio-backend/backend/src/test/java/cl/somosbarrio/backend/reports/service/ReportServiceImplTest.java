package cl.somosbarrio.backend.reports.service;

import cl.somosbarrio.backend.activities.entity.ActivityEntity;
import cl.somosbarrio.backend.activities.entity.ActivityStatus;
import cl.somosbarrio.backend.activities.repository.ActivityRepository;
import cl.somosbarrio.backend.auth.entity.UserEntity;
import cl.somosbarrio.backend.documents.entity.DocumentEntity;
import cl.somosbarrio.backend.documents.entity.DocumentStatus;
import cl.somosbarrio.backend.documents.entity.DocumentTemplateEntity;
import cl.somosbarrio.backend.documents.entity.DocumentType;
import cl.somosbarrio.backend.documents.repository.DocumentRepository;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.jpa.domain.Specification;

import java.io.ByteArrayInputStream;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReportServiceImplTest {

    @Mock private DocumentRepository documentRepository;
    @Mock private ActivityRepository activityRepository;
    @InjectMocks private ReportServiceImpl reportService;

    // -------------------------------------------------------------------------
    // Helpers para construir entidades de prueba
    // -------------------------------------------------------------------------

    private DocumentEntity buildDocument() {
        UserEntity user = new UserEntity();
        user.setFirstName("Admin");
        user.setLastName("Test");

        DocumentTemplateEntity template = new DocumentTemplateEntity();
        template.setDocumentType(DocumentType.ACTA);

        DocumentEntity doc = new DocumentEntity();
        doc.setCode("ACTA-001");
        doc.setTitle("Acta de prueba");
        doc.setTemplate(template);
        doc.setStatus(DocumentStatus.APROBADA);
        doc.setCreatedBy(user);
        doc.setApprovedAt(Instant.now());
        return doc;
    }

    private ActivityEntity buildActivity() {
        UserEntity user = new UserEntity();
        user.setFirstName("Coord");
        user.setLastName("Test");

        ActivityEntity act = new ActivityEntity();
        act.setTitle("Actividad de prueba");
        act.setTerritory("Santiago");
        act.setStatus(ActivityStatus.PLANIFICADA);
        act.setStartDate(LocalDate.of(2026, 5, 10));
        act.setEndDate(LocalDate.of(2026, 5, 10));
        act.setCreatedBy(user);
        return act;
    }

    // -------------------------------------------------------------------------
    // Tests de documentos
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("generateDocumentsExcel con datos devuelve un xlsx con 1 hoja y fila de datos")
    void generateDocumentsExcel_withData_returnsValidWorkbook() throws Exception {
        when(documentRepository.findAll(any(Specification.class)))
                .thenReturn(List.of(buildDocument()));

        byte[] bytes = reportService.generateDocumentsExcel(
                LocalDate.of(2026, 1, 1), LocalDate.of(2026, 12, 31));

        assertThat(bytes).isNotEmpty();
        try (Workbook wb = new XSSFWorkbook(new ByteArrayInputStream(bytes))) {
            Sheet sheet = wb.getSheetAt(0);
            assertThat(wb.getNumberOfSheets()).isEqualTo(1);
            assertThat(sheet.getSheetName()).isEqualTo("Documentos");
            assertThat(sheet.getLastRowNum()).isEqualTo(1); // cabecera + 1 fila de datos
        }
    }

    @Test
    @DisplayName("generateDocumentsExcel sin datos devuelve xlsx con solo cabecera")
    void generateDocumentsExcel_noData_returnsOnlyHeader() throws Exception {
        when(documentRepository.findAll(any(Specification.class)))
                .thenReturn(Collections.emptyList());

        byte[] bytes = reportService.generateDocumentsExcel(
                LocalDate.of(2026, 1, 1), LocalDate.of(2026, 1, 31));

        assertThat(bytes).isNotEmpty();
        try (Workbook wb = new XSSFWorkbook(new ByteArrayInputStream(bytes))) {
            assertThat(wb.getSheetAt(0).getLastRowNum()).isEqualTo(0); // solo cabecera
        }
    }

    // -------------------------------------------------------------------------
    // Tests de actividades
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("generateActivitiesExcel con datos devuelve un xlsx con 1 hoja y fila de datos")
    void generateActivitiesExcel_withData_returnsValidWorkbook() throws Exception {
        when(activityRepository.findAll(any(Specification.class)))
                .thenReturn(List.of(buildActivity()));

        byte[] bytes = reportService.generateActivitiesExcel(2026, 5);

        assertThat(bytes).isNotEmpty();
        try (Workbook wb = new XSSFWorkbook(new ByteArrayInputStream(bytes))) {
            Sheet sheet = wb.getSheetAt(0);
            assertThat(wb.getNumberOfSheets()).isEqualTo(1);
            assertThat(sheet.getSheetName()).isEqualTo("Actividades");
            assertThat(sheet.getLastRowNum()).isEqualTo(1);
        }
    }

    @Test
    @DisplayName("generateActivitiesExcel sin datos devuelve xlsx con solo cabecera")
    void generateActivitiesExcel_noData_returnsOnlyHeader() throws Exception {
        when(activityRepository.findAll(any(Specification.class)))
                .thenReturn(Collections.emptyList());

        byte[] bytes = reportService.generateActivitiesExcel(2026, 5);

        assertThat(bytes).isNotEmpty();
        try (Workbook wb = new XSSFWorkbook(new ByteArrayInputStream(bytes))) {
            assertThat(wb.getSheetAt(0).getLastRowNum()).isEqualTo(0);
        }
    }
}
