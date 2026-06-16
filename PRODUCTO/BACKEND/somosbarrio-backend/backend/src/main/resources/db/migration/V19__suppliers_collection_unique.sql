-- Eliminar duplicados en tablas de colección antes de crear índices únicos

DELETE FROM supplier_giros g1
USING supplier_giros g2
WHERE g1.ctid < g2.ctid
  AND g1.supplier_id = g2.supplier_id
  AND g1.giro = g2.giro;

DELETE FROM supplier_licitaciones l1
USING supplier_licitaciones l2
WHERE l1.ctid < l2.ctid
  AND l1.supplier_id = l2.supplier_id
  AND l1.id_licitacion = l2.id_licitacion;

DELETE FROM supplier_ordenes_compra o1
USING supplier_ordenes_compra o2
WHERE o1.ctid < o2.ctid
  AND o1.supplier_id = o2.supplier_id
  AND o1.orden_compra = o2.orden_compra;

CREATE UNIQUE INDEX uq_supplier_giros
    ON supplier_giros (supplier_id, giro);

CREATE UNIQUE INDEX uq_supplier_licitaciones
    ON supplier_licitaciones (supplier_id, id_licitacion);

CREATE UNIQUE INDEX uq_supplier_ordenes_compra
    ON supplier_ordenes_compra (supplier_id, orden_compra);
