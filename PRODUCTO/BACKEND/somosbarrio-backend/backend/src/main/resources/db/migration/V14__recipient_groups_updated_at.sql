-- recipient_groups: alinear con AuditableEntity (created_at + updated_at)
ALTER TABLE recipient_groups
    ADD COLUMN updated_at TIMESTAMPTZ;

UPDATE recipient_groups
SET updated_at = created_at
WHERE updated_at IS NULL;

ALTER TABLE recipient_groups
    ALTER COLUMN updated_at SET NOT NULL,
    ALTER COLUMN updated_at SET DEFAULT NOW();

CREATE TRIGGER trg_set_updated_at_recipient_groups
    BEFORE UPDATE ON recipient_groups
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();
