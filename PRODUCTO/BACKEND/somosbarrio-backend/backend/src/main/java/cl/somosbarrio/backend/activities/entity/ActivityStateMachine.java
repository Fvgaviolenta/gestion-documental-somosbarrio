package cl.somosbarrio.backend.activities.entity;

import cl.somosbarrio.backend.exception.custom.ConflictException;
import org.springframework.stereotype.Component;

@Component
public class ActivityStateMachine {

    /**
     * Valid transitions:
     * PLANIFICADA → EN_CURSO | CANCELADA
     * EN_CURSO    → FINALIZADA | CANCELADA
     * FINALIZADA  → (terminal)
     * CANCELADA   → (terminal)
     */
    public void validate(ActivityStatus from, ActivityStatus to) {
        boolean valid = switch (from) {
            case PLANIFICADA -> to == ActivityStatus.EN_CURSO || to == ActivityStatus.CANCELADA;
            case EN_CURSO    -> to == ActivityStatus.FINALIZADA || to == ActivityStatus.CANCELADA;
            case FINALIZADA, CANCELADA -> false;
        };

        if (!valid) {
            throw ConflictException.invalidStateTransition(from.name(), to.name());
        }
    }
}
