package cl.somosbarrio.backend.documents.entity;

import cl.somosbarrio.backend.activities.entity.ActivityEntity;
import cl.somosbarrio.backend.auth.entity.UserEntity;
import cl.somosbarrio.backend.common.audit.AuditableEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "documents")
@SQLDelete(sql = "UPDATE documents SET deleted_at = NOW() WHERE id = ? AND version = ?")
@SQLRestriction("deleted_at IS NULL")
@Getter
@Setter
public class DocumentEntity extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false, length = 40)
    private String code;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "template_id", nullable = false)
    private DocumentTemplateEntity template;

    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "activity_id")
    private ActivityEntity activity;

    @Column(nullable = false, length = 200)
    private String title;

    /** Persistido como JSONB en PostgreSQL; el tipo JDBC debe ser JSON, no varchar. */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "field_values", nullable = false)
    private String fieldValues = "{}";

    @Column(name = "generated_pdf_path", length = 500)
    private String generatedPdfPath;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private DocumentStatus status = DocumentStatus.BORRADOR;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "created_by", nullable = false)
    private UserEntity createdBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by")
    private UserEntity approvedBy;

    @Column(name = "approved_at")
    private Instant approvedAt;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @OneToMany(mappedBy = "document", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DocumentAttachmentEntity> attachments = new ArrayList<>();

    @Column(name = "deleted_at")
    private Instant deletedAt;

    @Version
    @Column(nullable = false)
    private int version = 0;
}
