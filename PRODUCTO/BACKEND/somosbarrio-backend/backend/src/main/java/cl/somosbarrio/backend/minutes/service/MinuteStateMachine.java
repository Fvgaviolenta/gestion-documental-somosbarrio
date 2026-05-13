package cl.somosbarrio.backend.minutes.service;

import cl.somosbarrio.backend.exception.custom.ConflictException;
import cl.somosbarrio.backend.exception.ErrorCode;
import cl.somosbarrio.backend.exception.custom.BusinessException;
import cl.somosbarrio.backend.minutes.entity.MinuteStatus;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.UUID;

/**
 * Maquina de estados de actas, alineada al modelo simplificado:
 *   - COLABORADOR redacta y envia a EN_REVISION.
 *   - ADMINISTRADOR aprueba (no se contempla rechazo en actas todavia).
 */
@Component
public class MinuteStateMachine {

    private static final String ROLE_ADMINISTRADOR = "ADMINISTRADOR";

    public void validate(MinuteStatus from, MinuteStatus to,
                         UUID actorId, UUID authorId, Set<String> actorRoles) {

        if (from == MinuteStatus.APROBADA) {
            throw ConflictException.invalidStateTransition(from.name(), to.name());
        }

        switch (from) {
            case BORRADOR -> {
                if (to != MinuteStatus.EN_REVISION) {
                    throw ConflictException.invalidStateTransition(from.name(), to.name());
                }
                boolean canTransition = actorId.equals(authorId)
                        || actorRoles.contains(ROLE_ADMINISTRADOR);
                if (!canTransition) {
                    throw new BusinessException(ErrorCode.ACCESS_DENIED,
                            "Solo el autor o un ADMINISTRADOR pueden enviar el acta a revision",
                            HttpStatus.FORBIDDEN);
                }
            }
            case EN_REVISION -> {
                if (to != MinuteStatus.APROBADA) {
                    throw ConflictException.invalidStateTransition(from.name(), to.name());
                }
                if (!actorRoles.contains(ROLE_ADMINISTRADOR)) {
                    throw new BusinessException(ErrorCode.ACCESS_DENIED,
                            "Solo un ADMINISTRADOR puede aprobar actas",
                            HttpStatus.FORBIDDEN);
                }
            }
            case APROBADA ->
                throw ConflictException.invalidStateTransition(from.name(), to.name());
        }
    }
}
