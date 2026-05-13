package cl.somosbarrio.backend.minutes.service;

import cl.somosbarrio.backend.audit.service.AuditLogService;
import cl.somosbarrio.backend.activities.entity.ActivityEntity;
import cl.somosbarrio.backend.activities.repository.ActivityRepository;
import cl.somosbarrio.backend.auth.entity.UserEntity;
import cl.somosbarrio.backend.auth.repository.UserRepository;
import cl.somosbarrio.backend.exception.custom.ConflictException;
import cl.somosbarrio.backend.exception.custom.ResourceNotFoundException;
import cl.somosbarrio.backend.minutes.dto.CreateMinuteRequest;
import cl.somosbarrio.backend.minutes.dto.MinuteDto;
import cl.somosbarrio.backend.minutes.dto.UpdateMinuteRequest;
import cl.somosbarrio.backend.minutes.entity.MinuteEntity;
import cl.somosbarrio.backend.minutes.entity.MinuteStatus;
import cl.somosbarrio.backend.minutes.mapper.MinuteMapper;
import cl.somosbarrio.backend.minutes.repository.MinuteAttachmentRepository;
import cl.somosbarrio.backend.minutes.repository.MinuteRepository;
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

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MinuteServiceImplTest {

    @Mock private MinuteRepository minuteRepository;
    @Mock private MinuteAttachmentRepository attachmentRepository;
    @Mock private ActivityRepository activityRepository;
    @Mock private UserRepository userRepository;
    @Mock private MinuteMapper minuteMapper;
    @Mock private MinuteStateMachine stateMachine;
    @Mock private AuditLogService auditLogService;
    @InjectMocks private MinuteServiceImpl minuteService;

    private MinuteEntity minute;
    private UserEntity author;
    private ActivityEntity activity;
    private final UUID minuteId = UUID.randomUUID();
    private final UUID authorId = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        author = new UserEntity();
        author.setId(authorId);

        activity = new ActivityEntity();
        activity.setId(UUID.randomUUID());
        activity.setTitle("Test Activity");

        minute = new MinuteEntity();
        minute.setId(minuteId);
        minute.setTitle("Acta Test");
        minute.setActivity(activity);
        minute.setAuthor(author);
        minute.setStatus(MinuteStatus.BORRADOR);
    }

    @Test
    @DisplayName("create lanza 404 si la actividad no existe")
    void create_activityNotFound_throws404() {
        CreateMinuteRequest request = new CreateMinuteRequest();
        request.setActivityId(UUID.randomUUID());
        request.setTitle("Nueva acta");

        when(activityRepository.findById(any())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> minuteService.create(request, authorId))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("create lanza 409 si el título ya existe en la actividad")
    void create_duplicateTitle_throws409() {
        CreateMinuteRequest request = new CreateMinuteRequest();
        request.setActivityId(activity.getId());
        request.setTitle("Título duplicado");

        when(activityRepository.findById(activity.getId())).thenReturn(Optional.of(activity));
        when(minuteRepository.existsByActivityIdAndTitle(activity.getId(), request.getTitle())).thenReturn(true);

        assertThatThrownBy(() -> minuteService.create(request, authorId))
                .isInstanceOf(ConflictException.class);
    }

    @Test
    @DisplayName("update lanza 409 si el acta no está en BORRADOR")
    void update_notDraft_throws409() {
        minute.setStatus(MinuteStatus.APROBADA);
        UpdateMinuteRequest request = new UpdateMinuteRequest();
        request.setTitle("Nuevo título");

        when(minuteRepository.findById(minuteId)).thenReturn(Optional.of(minute));

        assertThatThrownBy(() -> minuteService.update(minuteId, request, authorId))
                .isInstanceOf(ConflictException.class);
    }

    @Test
    @DisplayName("delete lanza 409 si el acta no está en BORRADOR")
    void delete_notDraft_throws409() {
        minute.setStatus(MinuteStatus.EN_REVISION);
        when(minuteRepository.findById(minuteId)).thenReturn(Optional.of(minute));

        assertThatThrownBy(() -> minuteService.delete(minuteId, authorId, Set.of("COLABORADOR")))
                .isInstanceOf(ConflictException.class);
    }

    @Test
    @DisplayName("delete por autor del acta funciona correctamente")
    void delete_byAuthor_success() {
        when(minuteRepository.findById(minuteId)).thenReturn(Optional.of(minute));
        doNothing().when(minuteRepository).delete(minute);

        minuteService.delete(minuteId, authorId, Set.of("COLABORADOR"));

        verify(minuteRepository).delete(minute);
    }

    @Test
    @DisplayName("changeStatus delega validación a la máquina de estados")
    void changeStatus_delegatesToStateMachine() {
        when(minuteRepository.findById(minuteId)).thenReturn(Optional.of(minute));
        when(minuteRepository.save(minute)).thenReturn(minute);
        when(minuteMapper.toDto(minute)).thenReturn(MinuteDto.builder().build());

        minuteService.changeStatus(minuteId, MinuteStatus.EN_REVISION, authorId, Set.of("COLABORADOR"));

        verify(stateMachine).validate(MinuteStatus.BORRADOR, MinuteStatus.EN_REVISION,
                authorId, authorId, Set.of("COLABORADOR"));
    }
}
