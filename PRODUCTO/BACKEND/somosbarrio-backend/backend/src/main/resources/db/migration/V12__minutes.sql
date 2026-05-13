-- Tablas de actas (minutes) faltantes en migraciones previas.
-- Las entidades JPA MinuteEntity / MinuteAttachmentEntity ya existen en codigo,
-- pero no habia DDL que las creara, lo que rompia ddl-auto=validate al arrancar.

CREATE TABLE minutes (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID         NOT NULL REFERENCES activities(id) ON DELETE RESTRICT,
    title       VARCHAR(200) NOT NULL CHECK (char_length(title) >= 3),
    content     TEXT,
    status      VARCHAR(20)  NOT NULL DEFAULT 'BORRADOR'
                    CHECK (status IN ('BORRADOR','EN_REVISION','APROBADA')),
    author_id   UUID         NOT NULL REFERENCES users(id),
    deleted_at  TIMESTAMPTZ,
    version     INTEGER      NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_minutes_activity_title UNIQUE (activity_id, title)
);

CREATE INDEX idx_minutes_activity   ON minutes(activity_id);
CREATE INDEX idx_minutes_author     ON minutes(author_id);
CREATE INDEX idx_minutes_status     ON minutes(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_minutes_deleted_at ON minutes(deleted_at) WHERE deleted_at IS NULL;

CREATE TABLE minute_attachments (
    id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    minute_id     UUID         NOT NULL REFERENCES minutes(id) ON DELETE CASCADE,
    original_name VARCHAR(260) NOT NULL,
    storage_path  VARCHAR(500) NOT NULL,
    mime_type     VARCHAR(100) NOT NULL
                      CHECK (mime_type IN (
                          'application/pdf',
                          'image/jpeg',
                          'image/png',
                          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                      )),
    size_bytes    BIGINT       NOT NULL CHECK (size_bytes > 0 AND size_bytes <= 20971520),
    uploaded_by   UUID         NOT NULL REFERENCES users(id),
    uploaded_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_minute_attachments_minute ON minute_attachments(minute_id);

-- Trigger updated_at faltante para esta nueva tabla, igual que las demas.
CREATE TRIGGER trg_set_updated_at_minutes
    BEFORE UPDATE ON minutes
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();
