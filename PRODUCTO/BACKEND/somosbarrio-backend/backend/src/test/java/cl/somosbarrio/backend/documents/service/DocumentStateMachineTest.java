package cl.somosbarrio.backend.documents.service;

import cl.somosbarrio.backend.documents.entity.DocumentStatus;
import cl.somosbarrio.backend.exception.custom.BusinessException;
import cl.somosbarrio.backend.exception.custom.ConflictException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class DocumentStateMachineTest {

    private DocumentStateMachine stateMachine;
    private final UUID authorId = UUID.randomUUID();
    private final UUID otherUserId = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        stateMachine = new DocumentStateMachine();
    }

    // --- BORRADOR -> EN_REVISION ---

    @Test
    @DisplayName("Autor (COLABORADOR) puede enviar su propio documento a EN_REVISION")
    void authorCanSendToRevision() {
        assertThatCode(() -> stateMachine.validate(
                DocumentStatus.BORRADOR, DocumentStatus.EN_REVISION,
                authorId, authorId, Set.of("COLABORADOR")))
                .doesNotThrowAnyException();
    }

    @Test
    @DisplayName("ADMINISTRADOR puede enviar documento de otro a EN_REVISION")
    void administradorCanSendToRevision() {
        assertThatCode(() -> stateMachine.validate(
                DocumentStatus.BORRADOR, DocumentStatus.EN_REVISION,
                otherUserId, authorId, Set.of("ADMINISTRADOR")))
                .doesNotThrowAnyException();
    }

    @Test
    @DisplayName("COLABORADOR no puede enviar a EN_REVISION un documento ajeno")
    void colaboradorCannotSendOthersToRevision() {
        assertThatThrownBy(() -> stateMachine.validate(
                DocumentStatus.BORRADOR, DocumentStatus.EN_REVISION,
                otherUserId, authorId, Set.of("COLABORADOR")))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    @DisplayName("Transicion BORRADOR -> APROBADA directa es invalida")
    void cannotSkipToApproved() {
        assertThatThrownBy(() -> stateMachine.validate(
                DocumentStatus.BORRADOR, DocumentStatus.APROBADA,
                authorId, authorId, Set.of("ADMINISTRADOR")))
                .isInstanceOf(ConflictException.class);
    }

    // --- EN_REVISION -> APROBADA ---

    @Test
    @DisplayName("ADMINISTRADOR puede aprobar documento")
    void administradorCanApprove() {
        assertThatCode(() -> stateMachine.validate(
                DocumentStatus.EN_REVISION, DocumentStatus.APROBADA,
                otherUserId, authorId, Set.of("ADMINISTRADOR")))
                .doesNotThrowAnyException();
    }

    @Test
    @DisplayName("COLABORADOR no puede aprobar documentos")
    void colaboradorCannotApprove() {
        assertThatThrownBy(() -> stateMachine.validate(
                DocumentStatus.EN_REVISION, DocumentStatus.APROBADA,
                otherUserId, authorId, Set.of("COLABORADOR")))
                .isInstanceOf(BusinessException.class);
    }

    // --- EN_REVISION -> RECHAZADA ---

    @Test
    @DisplayName("ADMINISTRADOR puede rechazar documento en revision")
    void administradorCanReject() {
        assertThatCode(() -> stateMachine.validate(
                DocumentStatus.EN_REVISION, DocumentStatus.RECHAZADA,
                otherUserId, authorId, Set.of("ADMINISTRADOR")))
                .doesNotThrowAnyException();
    }

    @Test
    @DisplayName("COLABORADOR no puede rechazar documentos")
    void colaboradorCannotReject() {
        assertThatThrownBy(() -> stateMachine.validate(
                DocumentStatus.EN_REVISION, DocumentStatus.RECHAZADA,
                otherUserId, authorId, Set.of("COLABORADOR")))
                .isInstanceOf(BusinessException.class);
    }

    // --- RECHAZADA -> BORRADOR ---

    @Test
    @DisplayName("Autor puede reabrir documento rechazado")
    void authorCanReopenRejected() {
        assertThatCode(() -> stateMachine.validate(
                DocumentStatus.RECHAZADA, DocumentStatus.BORRADOR,
                authorId, authorId, Set.of("COLABORADOR")))
                .doesNotThrowAnyException();
    }

    @Test
    @DisplayName("ADMINISTRADOR puede reabrir documento rechazado de otro autor")
    void administradorCanReopenRejected() {
        assertThatCode(() -> stateMachine.validate(
                DocumentStatus.RECHAZADA, DocumentStatus.BORRADOR,
                otherUserId, authorId, Set.of("ADMINISTRADOR")))
                .doesNotThrowAnyException();
    }

    @Test
    @DisplayName("Tercero sin permiso no puede reabrir documento rechazado")
    void unauthorizedCannotReopenRejected() {
        assertThatThrownBy(() -> stateMachine.validate(
                DocumentStatus.RECHAZADA, DocumentStatus.BORRADOR,
                otherUserId, authorId, Set.of("COLABORADOR")))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    @DisplayName("RECHAZADA -> EN_REVISION es transicion invalida")
    void rejectedToRevisionIsInvalid() {
        assertThatThrownBy(() -> stateMachine.validate(
                DocumentStatus.RECHAZADA, DocumentStatus.EN_REVISION,
                authorId, authorId, Set.of("ADMINISTRADOR")))
                .isInstanceOf(ConflictException.class);
    }

    // --- APROBADA es terminal ---

    @Test
    @DisplayName("No se puede hacer ninguna transicion desde APROBADA")
    void approvedIsTerminal() {
        assertThatThrownBy(() -> stateMachine.validate(
                DocumentStatus.APROBADA, DocumentStatus.BORRADOR,
                authorId, authorId, Set.of("ADMINISTRADOR")))
                .isInstanceOf(ConflictException.class);
    }

    @Test
    @DisplayName("APROBADA -> RECHAZADA tambien es invalida")
    void approvedToRejectedIsInvalid() {
        assertThatThrownBy(() -> stateMachine.validate(
                DocumentStatus.APROBADA, DocumentStatus.RECHAZADA,
                authorId, authorId, Set.of("ADMINISTRADOR")))
                .isInstanceOf(ConflictException.class);
    }
}
