-- Tabla principal de proveedores
CREATE TABLE suppliers (
    id                UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre_proveedor  VARCHAR(200) NOT NULL,
    rut_empresa       VARCHAR(12)  NOT NULL,
    email_contacto    VARCHAR(255) NOT NULL,
    telefono_contacto VARCHAR(30),
    direccion         TEXT,
    status            VARCHAR(20)  NOT NULL DEFAULT 'ACTIVO'
        CHECK (status IN ('ACTIVO', 'INACTIVO', 'SUSPENDIDO')),
    created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    deleted_at        TIMESTAMPTZ,
    version           INTEGER      NOT NULL DEFAULT 0
);

-- Giros comerciales (multi-valor, mínimo 1 requerido)
CREATE TABLE supplier_giros (
    supplier_id UUID         NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    giro        VARCHAR(200) NOT NULL
);

-- IDs de licitación (multi-valor, opcional)
CREATE TABLE supplier_licitaciones (
    supplier_id   UUID         NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    id_licitacion VARCHAR(100) NOT NULL
);

-- Órdenes de compra (multi-valor, opcional)
CREATE TABLE supplier_ordenes_compra (
    supplier_id  UUID         NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    orden_compra VARCHAR(100) NOT NULL
);

-- Índices
CREATE UNIQUE INDEX idx_suppliers_rut
    ON suppliers(rut_empresa) WHERE deleted_at IS NULL;

CREATE INDEX idx_suppliers_status
    ON suppliers(status) WHERE deleted_at IS NULL;

CREATE INDEX idx_suppliers_nombre
    ON suppliers(nombre_proveedor) WHERE deleted_at IS NULL;

CREATE INDEX idx_sgiros_supplier
    ON supplier_giros(supplier_id);

CREATE INDEX idx_slicitaciones_supplier
    ON supplier_licitaciones(supplier_id);

CREATE INDEX idx_sordenes_supplier
    ON supplier_ordenes_compra(supplier_id);

-- Trigger updated_at
CREATE TRIGGER trg_set_updated_at_suppliers
    BEFORE UPDATE ON suppliers
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();
