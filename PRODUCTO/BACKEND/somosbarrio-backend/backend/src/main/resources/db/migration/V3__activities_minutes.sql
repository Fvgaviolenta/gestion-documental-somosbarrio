CREATE TABLE activities (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    title       VARCHAR(200) NOT NULL,
    description TEXT,
    territory   VARCHAR(100) NOT NULL,
    start_date  DATE         NOT NULL,
    end_date    DATE,
    status      VARCHAR(20)  NOT NULL DEFAULT 'PLANIFICADA'
                    CHECK (status IN ('PLANIFICADA','EN_CURSO','FINALIZADA','CANCELADA')),
    created_by  UUID         NOT NULL REFERENCES users(id),
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    deleted_at  TIMESTAMPTZ,
    version     INTEGER      NOT NULL DEFAULT 0
);

CREATE INDEX idx_activities_status     ON activities(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_activities_created_by ON activities(created_by);
