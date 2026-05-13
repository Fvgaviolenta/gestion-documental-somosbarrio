package cl.somosbarrio.backend.minutes.service;

import cl.somosbarrio.backend.exception.custom.BusinessException;
import cl.somosbarrio.backend.exception.custom.ConflictException;
import cl.somosbarrio.backend.minutes.entity.MinuteStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class MinuteStateMachineTest {

    private MinuteStateMachine stateMachine;
    private final UUID authorId = UUID.randomUUID();
    private final UUID otherUserId = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        stateMachine = new MinuteStateMachine();
    }

    // --- BORRADOR -> EN_REVISION ---

    @Test
    @DisplayName("Autor (COLABORADOR) puede enviar su propia acta a EN_REVISION")
    void authorCanSendToRevision() {
        assertThatCode(() -> stateMachine.validate(
                MinuteStatus.BORRADOR, MinuteStatus.EN_REVISION,
                authorId, authorId, Set.of("COLABORADOR")))
                .doesNotThrowAnyException();
    }

    @Test
    @DisplayName("ADMINISTRADOR puede enviar acta de otro a EN_REVISION")
    void administradorCanSendToRevision() {
        assertThatCode(() -> stateMachine.validate(
                MinuteStatus.BORRADOR, MinuteStatus.EN_REVISION,
                otherUserId, authorId, Set.of("ADMINISTRADOR")))
                .doesNotThrowAnyException();
    }

    @Test
    @DisplayName("COLABORADOR no puede enviar a EN_REVISION un acta ajena")
    void colaboradorCannotSendOthersToRevision() {
        assertThatThrownBy(() -> stateMachine.validate(
                MinuteStatus.BORRADOR, MinuteStatus.EN_REVISION,
                otherUserId, authorId, Set.of("COLABORADOR")))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    @DisplayName("Transicion BORRADOR -> APROBADA directa es invalida")
    void cannotSkipToApproved() {
        assertThatThrownBy(() -> stateMachine.validate(
                MinuteStatus.BORRADOR, MinuteStatus.APROBADA,
                authorId, authorId, Set.of("ADMINISTRADOR")))
                .isInstanceOf(ConflictException.class);
    }

    // --- EN_REVISION -> APROBADA ---

    @Test
    @DisplayName("ADMINISTRADOR puede aprobar acta")
    void administradorCanApprove() {
        assertThatCode(() -> stateMachine.validate(
                MinuteStatus.EN_REVISION, MinuteStatus.APROBADA,
                otherUserId, authorId, Set.of("ADMINISTRADOR")))
                .doesNotThrowAnyException();
    }

    @Test
    @DisplayName("COLABORADOR no puede aprobar actas")
    void colaboradorCannotApprove() {
        assertThatThrownBy(() -> stateMachine.validate(
                MinuteStatus.EN_REVISION, MinuteStatus.APROBADA,
                otherUserId, authorId, Set.of("COLABORADOR")))
                .isInstanceOf(BusinessException.class);
    }

    // --- APROBADA es terminal ---

    @Test
    @DisplayName("No se puede hacer ninguna transicion desde APROBADA")
    void approvedIsTerminal() {
        assertThatThrownBy(() -> stateMachine.validate(
                MinuteStatus.APROBADA, MinuteStatus.BORRADOR,
                authorId, authorId, Set.of("ADMINISTRADOR")))
                .isInstanceOf(ConflictException.class);
    }

    @Test
    @DisplayName("APROBADA -> EN_REVISION tambien es invalida")
    void approvedToRevisionIsInvalid() {
        assertThatThrownBy(() -> stateMachine.validate(
                MinuteStatus.APROBADA, MinuteStatus.EN_REVISION,
                authorId, authorId, Set.of("ADMINISTRADOR")))
                .isInstanceOf(ConflictException.class);
    }
}
