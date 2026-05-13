package cl.somosbarrio.backend.documents.repository;

import cl.somosbarrio.backend.documents.dto.DocumentRepositoryFilter;
import cl.somosbarrio.backend.documents.entity.DocumentEntity;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.Instant;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

public final class DocumentSpecifications {

    private DocumentSpecifications() {}

    public static Specification<DocumentEntity> withFilter(DocumentRepositoryFilter filter) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (filter.getStatus() != null) {
                predicates.add(cb.equal(root.get("status"), filter.getStatus()));
            }
            if (filter.getType() != null) {
                predicates.add(cb.equal(root.join("template").get("documentType"), filter.getType()));
            }
            if (filter.getActivityId() != null) {
                predicates.add(cb.equal(root.join("activity").get("id"), filter.getActivityId()));
            }
            if (filter.getAuthorId() != null) {
                predicates.add(cb.equal(root.join("createdBy").get("id"), filter.getAuthorId()));
            }
            if (filter.getCode() != null && !filter.getCode().isBlank()) {
                predicates.add(cb.equal(cb.lower(root.get("code")), filter.getCode().toLowerCase(Locale.ROOT)));
            }
            if (filter.getFrom() != null) {
                Instant from = filter.getFrom().atStartOfDay().toInstant(ZoneOffset.UTC);
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), from));
            }
            if (filter.getTo() != null) {
                Instant to = filter.getTo().plusDays(1).atStartOfDay().toInstant(ZoneOffset.UTC);
                predicates.add(cb.lessThan(root.get("createdAt"), to));
            }
            if (Boolean.TRUE.equals(filter.getBelongsToMe()) && filter.getActorId() != null) {
                predicates.add(cb.equal(root.join("createdBy").get("id"), filter.getActorId()));
            }
            if (filter.getQ() != null && !filter.getQ().isBlank()) {
                String like = "%" + filter.getQ().toLowerCase(Locale.ROOT) + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("title")), like),
                        cb.like(cb.lower(root.get("code")), like),
                        cb.like(cb.lower(root.get("fieldValues")), like)
                ));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
