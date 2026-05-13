package cl.somosbarrio.backend.audit.service;

import cl.somosbarrio.backend.audit.entity.AuditAction;
import cl.somosbarrio.backend.audit.entity.AuditLogEntity;
import cl.somosbarrio.backend.audit.repository.AuditLogRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionStatus;

import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuditLogServiceImplTest {

    @Mock
    private AuditLogRepository auditLogRepository;

    @Mock
    private ObjectMapper objectMapper;

    @Mock
    private PlatformTransactionManager transactionManager;

    @InjectMocks
    private AuditLogServiceImpl auditLogService;

    @BeforeEach
    void setUp() {
        TransactionStatus txStatus = mock(TransactionStatus.class);
        when(transactionManager.getTransaction(any())).thenReturn(txStatus);
        auditLogService.initTx();
    }

    @Test
    @DisplayName("log() guarda la entidad con los campos correctos")
    void log_validParams_savesEntityWithCorrectFields() throws Exception {
        UUID actorId = UUID.randomUUID();
        String entityId = UUID.randomUUID().toString();
        when(objectMapper.writeValueAsString(any())).thenReturn("{\"key\":\"value\"}");

        auditLogService.log(actorId, AuditAction.CREATE, "Document", entityId,
                null, Map.of("title", "Test"));

        ArgumentCaptor<AuditLogEntity> captor = ArgumentCaptor.forClass(AuditLogEntity.class);
        verify(auditLogRepository).save(captor.capture());

        AuditLogEntity saved = captor.getValue();
        assertThat(saved.getUserId()).isEqualTo(actorId);
        assertThat(saved.getAction()).isEqualTo(AuditAction.CREATE);
        assertThat(saved.getEntityType()).isEqualTo("Document");
        assertThat(saved.getEntityId()).isEqualTo(entityId);
    }

    @Test
    @DisplayName("log() acepta actorId null para eventos de sistema")
    void log_nullActorId_savesEntityWithNullUserId() {
        auditLogService.log(null, AuditAction.LOGIN_FAILED, "User", UUID.randomUUID().toString(),
                null, null);

        ArgumentCaptor<AuditLogEntity> captor = ArgumentCaptor.forClass(AuditLogEntity.class);
        verify(auditLogRepository).save(captor.capture());
        assertThat(captor.getValue().getUserId()).isNull();
    }

    @Test
    @DisplayName("log() no propaga excepción cuando el repositorio falla")
    void log_whenRepositoryThrows_doesNotPropagateException() {
        doThrow(new RuntimeException("DB error")).when(auditLogRepository).save(any());

        assertThatCode(() ->
                auditLogService.log(UUID.randomUUID(), AuditAction.DELETE, "Activity",
                        UUID.randomUUID().toString(), null, null)
        ).doesNotThrowAnyException();
    }

    @Test
    @DisplayName("log() no propaga excepción cuando ObjectMapper falla al serializar")
    void log_whenSerializationFails_doesNotPropagateException() throws Exception {
        when(objectMapper.writeValueAsString(any()))
                .thenThrow(new com.fasterxml.jackson.core.JsonProcessingException("error") {});

        assertThatCode(() ->
                auditLogService.log(UUID.randomUUID(), AuditAction.UPDATE, "Document",
                        UUID.randomUUID().toString(), Map.of("k", "v"), null)
        ).doesNotThrowAnyException();
    }
}
