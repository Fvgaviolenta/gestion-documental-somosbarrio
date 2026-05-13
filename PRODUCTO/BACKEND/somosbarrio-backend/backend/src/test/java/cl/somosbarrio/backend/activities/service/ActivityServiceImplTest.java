package cl.somosbarrio.backend.activities.service;

import cl.somosbarrio.backend.activities.dto.ActivityDto;
import cl.somosbarrio.backend.activities.dto.CreateActivityRequest;
import cl.somosbarrio.backend.activities.entity.ActivityEntity;
import cl.somosbarrio.backend.activities.entity.ActivityStateMachine;
import cl.somosbarrio.backend.activities.entity.ActivityStatus;
import cl.somosbarrio.backend.activities.mapper.ActivityMapper;
import cl.somosbarrio.backend.activities.repository.ActivityRepository;
import cl.somosbarrio.backend.audit.service.AuditLogService;
import cl.somosbarrio.backend.auth.entity.UserEntity;
import cl.somosbarrio.backend.auth.repository.UserRepository;
import cl.somosbarrio.backend.documents.entity.DocumentEntity;
import cl.somosbarrio.backend.documents.repository.DocumentRepository;
import cl.somosbarrio.backend.exception.custom.ConflictException;
import cl.somosbarrio.backend.exception.custom.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ActivityServiceImplTest {

    @Mock private ActivityRepository activityRepository;
    @Mock private UserRepository userRepository;
    @Mock private DocumentRepository documentRepository;
    @Mock private ActivityMapper activityMapper;
    @Mock private ActivityStateMachine stateMachine;
    @Mock private AuditLogService auditLogService;
    @InjectMocks private ActivityServiceImpl activityService;

    private ActivityEntity activity;
    private UserEntity actor;
    private final UUID activityId = UUID.randomUUID();
    private final UUID actorId = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        actor = new UserEntity();
        actor.setId(actorId);

        activity = new ActivityEntity();
        activity.setId(activityId);
        activity.setTitle("Actividad Test");
        activity.setTerritory("Viña Norte");
        activity.setStatus(ActivityStatus.PLANIFICADA);
        activity.setCreatedBy(actor);
    }

    @Test
    @DisplayName("findAll retorna página mapeada")
    void findAll_returnsPagedResults() {
        ActivityDto dto = ActivityDto.builder().id(activityId).title("Actividad Test").build();
        Page<ActivityEntity> entityPage = new PageImpl<>(List.of(activity));

        when(activityRepository.findAll(any(Specification.class), any(Pageable.class)))  // unchecked: raw Specification intentional for mock
                .thenReturn(entityPage);
        when(activityMapper.toDto(activity)).thenReturn(dto);

        Page<ActivityDto> result = activityService.findAll(null, null, Pageable.unpaged());

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getTitle()).isEqualTo("Actividad Test");
    }

    @Test
    @DisplayName("findById retorna DTO cuando la actividad existe")
    void findById_existingId_returnsDto() {
        ActivityDto dto = ActivityDto.builder().id(activityId).build();
        when(activityRepository.findById(activityId)).thenReturn(Optional.of(activity));
        when(activityMapper.toDto(activity)).thenReturn(dto);

        ActivityDto result = activityService.findById(activityId);

        assertThat(result.getId()).isEqualTo(activityId);
    }

    @Test
    @DisplayName("findById lanza 404 cuando la actividad no existe")
    void findById_nonExistingId_throws404() {
        when(activityRepository.findById(any())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> activityService.findById(UUID.randomUUID()))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("create lanza 404 cuando el actor no existe")
    void create_actorNotFound_throws404() {
        when(userRepository.findById(actorId)).thenReturn(Optional.empty());

        CreateActivityRequest request = buildRequest();
        assertThatThrownBy(() -> activityService.create(request, actorId))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("create persiste y retorna el DTO")
    void create_validRequest_savesAndReturnsDto() {
        CreateActivityRequest request = buildRequest();
        ActivityDto dto = ActivityDto.builder().id(activityId).title(request.getTitle()).build();

        when(userRepository.findById(actorId)).thenReturn(Optional.of(actor));
        when(activityRepository.save(any())).thenReturn(activity);
        when(activityMapper.toDto(activity)).thenReturn(dto);

        ActivityDto result = activityService.create(request, actorId);

        assertThat(result.getTitle()).isEqualTo(request.getTitle());
        verify(activityRepository).save(any(ActivityEntity.class));
    }

    @Test
    @DisplayName("update lanza 404 cuando la actividad no existe")
    void update_notFound_throws404() {
        when(activityRepository.findById(activityId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> activityService.update(activityId, buildRequest(), actorId))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("changeStatus delega validación a la state machine")
    void changeStatus_delegatesToStateMachine() {
        ActivityDto dto = ActivityDto.builder().id(activityId).status(ActivityStatus.EN_CURSO).build();

        when(activityRepository.findById(activityId)).thenReturn(Optional.of(activity));
        when(activityRepository.save(activity)).thenReturn(activity);
        when(activityMapper.toDto(activity)).thenReturn(dto);

        activityService.changeStatus(activityId, ActivityStatus.EN_CURSO);

        verify(stateMachine).validate(ActivityStatus.PLANIFICADA, ActivityStatus.EN_CURSO);
    }

    @Test
    @DisplayName("changeStatus lanza 404 si la actividad no existe")
    void changeStatus_notFound_throws404() {
        when(activityRepository.findById(any())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> activityService.changeStatus(UUID.randomUUID(), ActivityStatus.EN_CURSO))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("delete lanza 409 si la actividad tiene documentos asociados")
    void delete_withRelatedDocuments_throwsConflict() {
        Page<DocumentEntity> docPage = new PageImpl<>(List.of(new DocumentEntity()));

        when(activityRepository.findById(activityId)).thenReturn(Optional.of(activity));
        when(documentRepository.findByActivityId(eq(activityId), any(Pageable.class)))
                .thenReturn(docPage);

        assertThatThrownBy(() -> activityService.delete(activityId))
                .isInstanceOf(ConflictException.class);

        verify(activityRepository, never()).delete(any(ActivityEntity.class));
    }

    @Test
    @DisplayName("delete elimina la actividad si no tiene documentos")
    void delete_noRelatedDocuments_deletesActivity() {
        when(activityRepository.findById(activityId)).thenReturn(Optional.of(activity));
        when(documentRepository.findByActivityId(eq(activityId), any(Pageable.class)))
                .thenReturn(Page.empty());

        activityService.delete(activityId);

        verify(activityRepository).delete(any(ActivityEntity.class));
    }

    @Test
    @DisplayName("delete lanza 404 si la actividad no existe")
    void delete_notFound_throws404() {
        when(activityRepository.findById(any())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> activityService.delete(UUID.randomUUID()))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    private CreateActivityRequest buildRequest() {
        CreateActivityRequest req = new CreateActivityRequest();
        req.setTitle("Actividad de prueba");
        req.setTerritory("Viña Norte");
        req.setStartDate(LocalDate.now().plusDays(7));
        return req;
    }
}
