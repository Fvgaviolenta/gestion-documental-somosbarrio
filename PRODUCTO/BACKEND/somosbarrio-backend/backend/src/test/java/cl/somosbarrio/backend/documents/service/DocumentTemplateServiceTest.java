package cl.somosbarrio.backend.documents.service;

import cl.somosbarrio.backend.documents.dto.CreateDocumentTemplateRequest;
import cl.somosbarrio.backend.documents.dto.DocumentTemplateDto;
import cl.somosbarrio.backend.documents.entity.DocumentTemplateEntity;
import cl.somosbarrio.backend.documents.entity.DocumentType;
import cl.somosbarrio.backend.documents.mapper.DocumentMapper;
import cl.somosbarrio.backend.documents.repository.DocumentRepository;
import cl.somosbarrio.backend.documents.repository.DocumentTemplateRepository;
import cl.somosbarrio.backend.exception.custom.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DocumentTemplateServiceTest {

    @Mock private DocumentTemplateRepository templateRepository;
    @Mock private DocumentRepository documentRepository;
    @Mock private DocumentMapper documentMapper;
    @InjectMocks private DocumentTemplateServiceImpl templateService;

    private DocumentTemplateEntity activeTemplate;
    private DocumentTemplateEntity inactiveTemplate;
    private final UUID templateId = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        activeTemplate = new DocumentTemplateEntity();
        activeTemplate.setId(templateId);
        activeTemplate.setCode("ACTA_GENERAL");
        activeTemplate.setName("Acta General de Reunión");
        activeTemplate.setDocumentType(DocumentType.ACTA);
        activeTemplate.setActive(true);

        inactiveTemplate = new DocumentTemplateEntity();
        inactiveTemplate.setId(UUID.randomUUID());
        inactiveTemplate.setCode("OFICIO_OLD");
        inactiveTemplate.setName("Oficio Antiguo");
        inactiveTemplate.setDocumentType(DocumentType.OFICIO);
        inactiveTemplate.setActive(false);
    }

    @Test
    @DisplayName("findAllActive retorna solo plantillas activas")
    void findAllActive_returnsActiveTemplatesOnly() {
        DocumentTemplateDto dto = DocumentTemplateDto.builder()
                .id(templateId).code("ACTA_GENERAL").build();

        when(templateRepository.findByIsActiveTrue()).thenReturn(List.of(activeTemplate));
        when(documentMapper.toTemplateDto(activeTemplate)).thenReturn(dto);

        List<DocumentTemplateDto> result = templateService.findAllActive();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getCode()).isEqualTo("ACTA_GENERAL");
        verify(templateRepository).findByIsActiveTrue();
        verify(documentMapper, never()).toTemplateDto(inactiveTemplate);
    }

    @Test
    @DisplayName("create persiste la plantilla cuando el código no existe")
    void create_validTemplate_persists() {
        CreateDocumentTemplateRequest request = buildRequest();
        DocumentTemplateDto dto = DocumentTemplateDto.builder()
                .id(templateId).code("NUEVO_TEMPLATE").build();

        when(templateRepository.existsByCode("NUEVO_TEMPLATE")).thenReturn(false);
        when(templateRepository.save(any())).thenReturn(activeTemplate);
        when(documentMapper.toTemplateDto(activeTemplate)).thenReturn(dto);

        DocumentTemplateDto result = templateService.create(request);

        assertThat(result.getCode()).isEqualTo("NUEVO_TEMPLATE");
        verify(templateRepository).save(any(DocumentTemplateEntity.class));
    }

    @Test
    @DisplayName("delete desactiva la plantilla cuando hay documentos que la referencian")
    void delete_withReferencedDocuments_deactivatesInsteadOfDeleting() {
        when(templateRepository.findById(templateId)).thenReturn(Optional.of(activeTemplate));
        when(documentRepository.existsByTemplateId(templateId)).thenReturn(true);

        templateService.delete(templateId);

        assertThat(activeTemplate.isActive()).isFalse();
        verify(templateRepository).save(activeTemplate);
        verify(templateRepository, never()).delete(any());
    }

    @Test
    @DisplayName("delete elimina físicamente la plantilla cuando no hay documentos referenciados")
    void delete_withoutReferencedDocuments_hardDeletes() {
        when(templateRepository.findById(templateId)).thenReturn(Optional.of(activeTemplate));
        when(documentRepository.existsByTemplateId(templateId)).thenReturn(false);

        templateService.delete(templateId);

        verify(templateRepository).delete(activeTemplate);
        verify(templateRepository, never()).save(any());
    }

    @Test
    @DisplayName("delete lanza 404 si la plantilla no existe")
    void delete_notFound_throws404() {
        when(templateRepository.findById(any())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> templateService.delete(UUID.randomUUID()))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    private CreateDocumentTemplateRequest buildRequest() {
        CreateDocumentTemplateRequest req = new CreateDocumentTemplateRequest();
        req.setCode("NUEVO_TEMPLATE");
        req.setName("Plantilla de prueba");
        req.setDocumentType(DocumentType.ACTA);
        req.setFieldsSchema("{\"fields\":[]}");
        return req;
    }
}
