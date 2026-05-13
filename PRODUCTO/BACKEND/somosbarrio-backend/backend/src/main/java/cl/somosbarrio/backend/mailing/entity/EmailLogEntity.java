package cl.somosbarrio.backend.mailing.entity;

import cl.somosbarrio.backend.auth.entity.UserEntity;
import cl.somosbarrio.backend.documents.entity.DocumentEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "email_logs")
@Getter
@Setter
public class EmailLogEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id")
    private DocumentEntity document;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_group_id")
    private RecipientGroupEntity recipientGroup;

    @Column(name = "to_addresses", nullable = false, columnDefinition = "TEXT")
    private String toAddresses;

    @Column(nullable = false, length = 200)
    private String subject;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EmailStatus status;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sent_by", nullable = false)
    private UserEntity sentBy;

    @Column(name = "sent_at", nullable = false)
    private Instant sentAt;
}
