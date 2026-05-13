CREATE TABLE documents (
    id                  UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    code                VARCHAR(40)  UNIQUE NOT NULL,
    template_id         UUID         NOT NULL REFERENCES document_templates(id) ON DELETE RESTRICT,
    activity_id         UUID         REFERENCES activities(id) ON DELETE RESTRICT,
    title               VARCHAR(200) NOT NULL CHECK (char_length(title) >= 3),
    field_values        JSONB        NOT NULL DEFAULT '{}'::jsonb,
    generated_pdf_path  VARCHAR(500),
    status              VARCHAR(20)  NOT NULL DEFAULT 'BORRADOR'
                            CHECK (status IN ('BORRADOR','EN_REVISION','APROBADA','RECHAZADA')),
    created_by          UUID         NOT NULL REFERENCES users(id),
    approved_by         UUID         REFERENCES users(id),
    approved_at         TIMESTAMPTZ,
    rejection_reason    TEXT,
    deleted_at          TIMESTAMPTZ,
    version             INTEGER      NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_documents_status      ON documents(status);
CREATE INDEX idx_documents_activity    ON documents(activity_id);
CREATE INDEX idx_documents_created_by  ON documents(created_by);
CREATE INDEX idx_documents_template    ON documents(template_id);
CREATE INDEX idx_documents_deleted_at  ON documents(deleted_at) WHERE deleted_at IS NULL;

CREATE TABLE document_attachments (
    id                UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id       UUID         NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    original_filename VARCHAR(260) NOT NULL,
    stored_filename   VARCHAR(260) NOT NULL,
    content_type      VARCHAR(120) NOT NULL
                          CHECK (content_type IN (
                              'application/pdf',
                              'image/jpeg',
                              'image/png',
                              'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                          )),
    size_bytes        BIGINT       NOT NULL CHECK (size_bytes > 0 AND size_bytes <= 20971520),
    uploaded_by       UUID         NOT NULL REFERENCES users(id),
    created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_doc_attachments_document ON document_attachments(document_id);
