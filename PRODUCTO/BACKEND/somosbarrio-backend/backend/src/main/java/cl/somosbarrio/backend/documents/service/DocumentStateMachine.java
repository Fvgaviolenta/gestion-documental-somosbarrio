package cl.somosbarrio.backend.documents.service;

import cl.somosbarrio.backend.documents.entity.DocumentStatus;
import cl.somosbarrio.backend.exception.ErrorCode;
import cl.somosbarrio.backend.exception.custom.BusinessException;
import cl.somosbarrio.backend.exception.custom.ConflictException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.UUID;

/**
 * Maquina de estados de documentos.
 *
 * Modelo simplificado de roles (decision de cliente):
 *   - COLABORADOR: redacta el documento y lo envia a EN_REVISION; reabre si fue RECHAZADA.
 *   - ADMINISTRADOR: revisa, aprueba o rechaza. Es el unico que cierra el ciclo de vida.
 *
 * Transiciones:
 *   BORRADOR    -> EN_REVISION  (autor o ADMINISTRADOR)
 *   EN_REVISION -> APROBADA     (solo ADMINISTRADOR)
 *   EN_REVISION -> RECHAZADA    (solo ADMINISTRADOR)
 *   RECHAZADA   -> BORRADOR     (autor o ADMINISTRADOR)
 *   APROBADA es estado terminal.
 */
@Component
public class DocumentStateMachine {

    private static final String ROLE_ADMINISTRADOR = "ADMINISTRADOR";

    public void validate(DocumentStatus from, DocumentStatus to,
                         UUID actorId, UUID authorId, Set<String> actorRoles) {

        if (from == DocumentStatus.APROBADA) {
            throw ConflictException.invalidStateTransition(from.name(), to.name());
        }

        switch (from) {
            case BORRADOR -> {
                if (to != DocumentStatus.EN_REVISION) {
                    throw ConflictException.invalidStateTransition(from.name(), to.name());
                }
                boolean canTransition = actorId.equals(authorId)
                        || actorRoles.contains(ROLE_ADMINISTRADOR);
                if (!canTransition) {
                    throw new BusinessException(ErrorCode.ACCESS_DENIED,
                            "Solo el autor o un ADMINISTRADOR pueden enviar el documento a revision",
                            HttpStatus.FORBIDDEN);
                }
            }
            case EN_REVISION -> {
                if (to == DocumentStatus.APROBADA || to == DocumentStatus.RECHAZADA) {
                    if (!actorRoles.contains(ROLE_ADMINISTRADOR)) {
                        throw new BusinessException(ErrorCode.ACCESS_DENIED,
                                "Solo un ADMINISTRADOR puede aprobar o rechazar documentos",
                                HttpStatus.FORBIDDEN);
                    }
                } else {
                    throw ConflictException.invalidStateTransition(from.name(), to.name());
                }
            }
            case RECHAZADA -> {
                if (to != DocumentStatus.BORRADOR) {
                    throw ConflictException.invalidStateTransition(from.name(), to.name());
                }
                boolean canReopen = actorId.equals(authorId) || actorRoles.contains(ROLE_ADMINISTRADOR);
                if (!canReopen) {
                    throw new BusinessException(ErrorCode.ACCESS_DENIED,
                            "Solo el autor o un ADMINISTRADOR pueden reabrir un documento rechazado",
                            HttpStatus.FORBIDDEN);
                }
            }
            case APROBADA ->
                throw ConflictException.invalidStateTransition(from.name(), to.name());
        }
    }
}
