package cl.somosbarrio.backend.documents.service;

import cl.somosbarrio.backend.audit.service.AuditLogService;
import cl.somosbarrio.backend.activities.repository.ActivityRepository;
import cl.somosbarrio.backend.auth.entity.UserEntity;
import cl.somosbarrio.backend.auth.repository.UserRepository;
import cl.somosbarrio.backend.documents.dto.CreateDocumentRequest;
import cl.somosbarrio.backend.documents.dto.DocumentDto;
import cl.somosbarrio.backend.documents.dto.UpdateDocumentRequest;
import cl.somosbarrio.backend.documents.entity.DocumentEntity;
import cl.somosbarrio.backend.documents.entity.DocumentStatus;
import cl.somosbarrio.backend.documents.entity.DocumentTemplateEntity;
import cl.somosbarrio.backend.documents.entity.DocumentType;
import cl.somosbarrio.backend.documents.mapper.DocumentMapper;
import cl.somosbarrio.backend.documents.pdf.DocumentPdfGenerationService;
import cl.somosbarrio.backend.documents.pdf.GeneratedDocumentFilenames;
import cl.somosbarrio.backend.documents.repository.DocumentAttachmentRepository;
import cl.somosbarrio.backend.documents.repository.DocumentRepository;
import cl.somosbarrio.backend.documents.repository.DocumentTemplateRepository;
import cl.somosbarrio.backend.exception.custom.BusinessException;
import cl.somosbarrio.backend.exception.custom.ConflictException;
import cl.somosbarrio.backend.exception.custom.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DocumentServiceImplTest {

    @Mock private DocumentRepository documentRepository;
    @Mock private DocumentAttachmentRepository attachmentRepository;
    @Mock private DocumentTemplateRepository templateRepository;
    @Mock private ActivityRepository activityRepository;
    @Mock private UserRepository userRepository;
    @Mock private DocumentMapper documentMapper;
    @Mock private DocumentStateMachine stateMachine;
    @Mock private DocumentCodeGenerator codeGenerator;
    @Mock private DocumentPdfGenerationService documentPdfGenerationService;
    @Mock private AuditLogService auditLogService;
    @InjectMocks private DocumentServiceImpl documentService;

    private DocumentEntity document;
    private DocumentTemplateEntity template;
    private UserEntity author;
    private final UUID documentId = UUID.randomUUID();
    private final UUID authorId   = UUID.randomUUID();
    private final UUID templateId = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        author = new UserEntity();
        author.setId(authorId);
        author.setFirstName("Pedro");
        author.setLastName("González");

        template = new DocumentTemplateEntity();
        template.setId(templateId);
        template.setCode("ACTA_GENERAL");
        template.setDocumentType(DocumentType.ACTA);
        template.setActive(true);

        document = new DocumentEntity();
        document.setId(documentId);
        document.setCode("ACT-2026-0001");
        document.setTitle("Acta Test");
        document.setTemplate(template);
        document.setCreatedBy(author);
        document.setStatus(DocumentStatus.BORRADOR);
    }

    @Test
    @DisplayName("findById retorna DTO cuando el documento existe")
    void findById_existingId_returnsDto() {
        DocumentDto dto = DocumentDto.builder().id(documentId).build();
        when(documentRepository.findById(documentId)).thenReturn(Optional.of(document));
        when(documentMapper.toDto(document)).thenReturn(dto);
        when(attachmentRepository.findByDocumentId(documentId)).thenReturn(java.util.List.of());

        DocumentDto result = documentService.findById(documentId);

        assertThat(result.getId()).isEqualTo(documentId);
    }

    @Test
    @DisplayName("findById lanza 404 cuando el documento no existe")
    void findById_notFound_throws404() {
        when(documentRepository.findById(any())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> documentService.findById(UUID.randomUUID()))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("create lanza 404 si la plantilla no existe")
    void create_templateNotFound_throws404() {
        when(templateRepository.findById(any())).thenReturn(Optional.empty());

        CreateDocumentRequest request = buildRequest();
        assertThatThrownBy(() -> documentService.create(request, authorId))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("create lanza 409 si la plantilla está inactiva")
    void create_inactiveTemplate_throws409() {
        template.setActive(false);
        when(templateRepository.findById(templateId)).thenReturn(Optional.of(template));

        CreateDocumentRequest request = buildRequest();
        assertThatThrownBy(() -> documentService.create(request, authorId))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    @DisplayName("create persiste y retorna el DTO")
    void create_validRequest_savesAndReturnsDto() {
        CreateDocumentRequest request = buildRequest();
        DocumentDto dto = DocumentDto.builder().id(documentId).title(request.getTitle()).build();

        when(templateRepository.findById(templateId)).thenReturn(Optional.of(template));
        when(userRepository.findById(authorId)).thenReturn(Optional.of(author));
        when(codeGenerator.generate(DocumentType.ACTA)).thenReturn("ACT-2026-0001");
        when(documentRepository.save(any())).thenReturn(document);
        when(documentMapper.toDto(document)).thenReturn(dto);

        DocumentDto result = documentService.create(request, authorId);

        assertThat(result.getTitle()).isEqualTo(request.getTitle());
        verify(documentRepository).save(any(DocumentEntity.class));
    }

    @Test
    @DisplayName("update lanza 409 si el documento no está en BORRADOR o RECHAZADA")
    void update_notEditableState_throws409() {
        document.setStatus(DocumentStatus.EN_REVISION);
        UpdateDocumentRequest request = new UpdateDocumentRequest();
        request.setTitle("Nuevo título");

        when(documentRepository.findById(documentId)).thenReturn(Optional.of(document));

        assertThatThrownBy(() -> documentService.update(documentId, request, authorId))
                .isInstanceOf(ConflictException.class);
    }

    @Test
    @DisplayName("changeStatus delega validación a la máquina de estados")
    void changeStatus_delegatesToStateMachine() {
        DocumentDto dto = DocumentDto.builder().id(documentId).status(DocumentStatus.EN_REVISION).build();

        when(documentRepository.findById(documentId)).thenReturn(Optional.of(document));
        when(documentRepository.save(document)).thenReturn(document);
        when(documentMapper.toDto(document)).thenReturn(dto);

        documentService.changeStatus(documentId, DocumentStatus.EN_REVISION, authorId, Set.of("COLABORADOR"));

        verify(stateMachine).validate(DocumentStatus.BORRADOR, DocumentStatus.EN_REVISION,
                authorId, authorId, Set.of("COLABORADOR"));
    }

    @Test
    @DisplayName("approve establece approvedBy y approvedAt")
    void approve_setsApprovedByAndAt() {
        document.setStatus(DocumentStatus.EN_REVISION);
        DocumentDto dto = DocumentDto.builder().id(documentId).status(DocumentStatus.APROBADA).build();

        when(documentRepository.findById(documentId)).thenReturn(Optional.of(document));
        when(userRepository.findById(authorId)).thenReturn(Optional.of(author));
        when(documentPdfGenerationService.generateAndStorePdf(any(DocumentEntity.class)))
                .thenReturn("documents/generated/ACTA/" + documentId + "/" + GeneratedDocumentFilenames.pdfFileName(document));
        when(documentRepository.save(document)).thenReturn(document);
        when(documentMapper.toDto(document)).thenReturn(dto);

        documentService.changeStatus(documentId, DocumentStatus.APROBADA, authorId, Set.of("ADMINISTRADOR"));

        assertThat(document.getApprovedBy()).isEqualTo(author);
        assertThat(document.getApprovedAt()).isNotNull();
        assertThat(document.getGeneratedPdfPath()).contains("documents/generated/ACTA/");
        assertThat(document.getGeneratedPdfPath()).endsWith(".pdf");
    }

    @Test
    @DisplayName("reject establece rejectionReason y estado RECHAZADA")
    void reject_setsRejectionReason() {
        document.setStatus(DocumentStatus.EN_REVISION);
        DocumentDto dto = DocumentDto.builder().id(documentId).status(DocumentStatus.RECHAZADA).build();

        when(documentRepository.findById(documentId)).thenReturn(Optional.of(document));
        when(documentRepository.save(document)).thenReturn(document);
        when(documentMapper.toDto(document)).thenReturn(dto);

        documentService.reject(documentId, "Falta información de asistentes", authorId, Set.of("ADMINISTRADOR"));

        assertThat(document.getStatus()).isEqualTo(DocumentStatus.RECHAZADA);
        assertThat(document.getRejectionReason()).isEqualTo("Falta información de asistentes");
    }

    @Test
    @DisplayName("delete lanza 409 si el documento no está en BORRADOR")
    void delete_notDraft_throws409() {
        document.setStatus(DocumentStatus.EN_REVISION);
        when(documentRepository.findById(documentId)).thenReturn(Optional.of(document));

        assertThatThrownBy(() -> documentService.delete(documentId, authorId, Set.of("COLABORADOR")))
                .isInstanceOf(ConflictException.class);
    }

    @Test
    @DisplayName("delete por autor funciona correctamente")
    void delete_byAuthor_success() {
        when(documentRepository.findById(documentId)).thenReturn(Optional.of(document));
        doNothing().when(documentRepository).delete(document);

        documentService.delete(documentId, authorId, Set.of("COLABORADOR"));

        verify(documentRepository).delete(document);
    }

    @Test
    @DisplayName("delete lanza 403 si no es autor ni ADMIN")
    void delete_byUnauthorized_throws403() {
        when(documentRepository.findById(documentId)).thenReturn(Optional.of(document));

        assertThatThrownBy(() -> documentService.delete(documentId, UUID.randomUUID(), Set.of("COLABORADOR")))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    @DisplayName("previewMergedDocx permite autor en BORRADOR")
    void previewMergedDocx_authorInDraft_returnsPath() {
        when(documentRepository.findById(documentId)).thenReturn(Optional.of(document));
        when(documentPdfGenerationService.mergePreviewDocx(document))
                .thenReturn("documents/previews/" + documentId + "/" + GeneratedDocumentFilenames.previewMergedDocxFileName(document));

        String path = documentService.previewMergedDocx(documentId, authorId, Set.of("COLABORADOR"));

        assertThat(path).contains("documents/previews");
        verify(documentPdfGenerationService).mergePreviewDocx(document);
    }

    @Test
    @DisplayName("previewMergedDocx lanza 409 si documento ya APROBADA")
    void previewMergedDocx_whenApproved_throws409() {
        document.setStatus(DocumentStatus.APROBADA);
        when(documentRepository.findById(documentId)).thenReturn(Optional.of(document));

        assertThatThrownBy(() -> documentService.previewMergedDocx(documentId, authorId, Set.of("COLABORADOR")))
                .isInstanceOf(ConflictException.class);
        verifyNoInteractions(documentPdfGenerationService);
    }

    @Test
    @DisplayName("delete lanza 404 si el documento no existe")
    void delete_notFound_throws404() {
        when(documentRepository.findById(any())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> documentService.delete(UUID.randomUUID(), authorId, Set.of("ADMINISTRADOR")))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    private CreateDocumentRequest buildRequest() {
        CreateDocumentRequest req = new CreateDocumentRequest();
        req.setTemplateId(templateId);
        req.setTitle("Documento de prueba");
        req.setFieldValues("{\"asistentes\":\"10 vecinos\",\"lugar\":\"Sede social\"}");
        return req;
    }
}
