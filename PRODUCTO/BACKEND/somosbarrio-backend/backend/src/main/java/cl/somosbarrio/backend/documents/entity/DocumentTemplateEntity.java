package cl.somosbarrio.backend.documents.entity;

import cl.somosbarrio.backend.common.audit.AuditableEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.UUID;

@Entity
@Table(name = "document_templates")
@Getter
@Setter
public class DocumentTemplateEntity extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false, length = 40)
    private String code;

    @Column(nullable = false, length = 160)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "document_type", nullable = false, length = 30)
    private DocumentType documentType;

    @Column(columnDefinition = "TEXT")
    private String description;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "fields_schema", nullable = false)
    private String fieldsSchema = "{}";

    /** Ruta relativa a {@code app.template.root} del archivo .docx matriz (merge al aprobar). */
    @Column(name = "template_file_path", length = 500)
    private String templateFilePath;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;
}
