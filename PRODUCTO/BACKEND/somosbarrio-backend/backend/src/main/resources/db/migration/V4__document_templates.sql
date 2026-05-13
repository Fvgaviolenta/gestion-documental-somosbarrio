CREATE TABLE document_templates (
    id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    code          VARCHAR(40)  UNIQUE NOT NULL,
    name          VARCHAR(160) NOT NULL,
    document_type VARCHAR(30)  NOT NULL
                      CHECK (document_type IN ('ACTA','INFORME','OFICIO','MEMO','OTRO')),
    description   TEXT,
    fields_schema JSONB        NOT NULL DEFAULT '{}'::jsonb,
    is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_doc_templates_type     ON document_templates(document_type);
CREATE INDEX idx_doc_templates_active   ON document_templates(is_active);
