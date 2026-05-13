CREATE TABLE recipient_groups (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(120) UNIQUE NOT NULL,
    description TEXT,
    emails      JSONB        NOT NULL DEFAULT '[]'::jsonb,
    is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE email_logs (
    id                  UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id         UUID         REFERENCES documents(id) ON DELETE SET NULL,
    recipient_group_id  UUID         REFERENCES recipient_groups(id) ON DELETE SET NULL,
    to_addresses        TEXT         NOT NULL,
    subject             VARCHAR(200) NOT NULL,
    status              VARCHAR(20)  NOT NULL CHECK (status IN ('ENVIADO','FALLIDO')),
    error_message       TEXT,
    sent_by             UUID         NOT NULL REFERENCES users(id),
    sent_at             TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_email_logs_document ON email_logs(document_id);
CREATE INDEX idx_email_logs_sent_by  ON email_logs(sent_by);
CREATE INDEX idx_email_logs_sent_at  ON email_logs(sent_at);
