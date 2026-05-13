package cl.somosbarrio.backend.documents.service;

import cl.somosbarrio.backend.documents.entity.DocumentType;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Year;

/**
 * Genera codigos de documento del tipo {@code ACT-2026-0001} usando un contador
 * atomico en BD por {@code (document_type, year)}. Reemplaza el calculo basado en
 * {@code count()} que generaba colisiones con concurrencia y no respetaba el ano.
 */
@Component
public class DocumentCodeGenerator {

    @PersistenceContext
    private EntityManager entityManager;

    @Transactional(propagation = Propagation.REQUIRED)
    public String generate(DocumentType type) {
        String prefix = prefixFor(type);
        int year = Year.now().getValue();

        Object raw = entityManager.createNativeQuery("""
                INSERT INTO document_code_counters (document_type, year, last_value)
                VALUES (:type, :year, 1)
                ON CONFLICT (document_type, year)
                DO UPDATE SET last_value = document_code_counters.last_value + 1
                RETURNING last_value
                """)
                .setParameter("type", type.name())
                .setParameter("year", year)
                .getSingleResult();

        long next = raw instanceof Number n ? n.longValue() : 1L;
        return String.format("%s-%d-%04d", prefix, year, next);
    }

    private static String prefixFor(DocumentType type) {
        return switch (type) {
            case ACTA    -> "ACT";
            case INFORME -> "INF";
            case OFICIO  -> "OFI";
            case MEMO    -> "MEM";
            case OTRO    -> "DOC";
        };
    }
}
