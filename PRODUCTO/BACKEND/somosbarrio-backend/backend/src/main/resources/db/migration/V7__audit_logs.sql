CREATE TABLE audit_logs (
    id              BIGSERIAL    PRIMARY KEY,
    user_id         UUID         REFERENCES users(id) ON DELETE SET NULL,
    action          VARCHAR(30)  NOT NULL
                        CHECK (action IN ('CREATE','UPDATE','DELETE','APPROVE','REJECT',
                                          'LOGIN','LOGIN_FAILED','EMAIL_SENT',
                                          'PDF_GENERATED','REPORT_GENERATED')),
    entity_type     VARCHAR(60)  NOT NULL,
    entity_id       VARCHAR(36),
    before_data     JSONB,
    after_data      JSONB,
    ip_address      VARCHAR(45),
    correlation_id  VARCHAR(36),
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_entity    ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_user_date ON audit_logs(user_id, created_at);
