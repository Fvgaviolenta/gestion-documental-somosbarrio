-- Contador atomico para correlativos de documentos por (tipo, anio).
-- Reemplaza el calculo basado en COUNT(*) que no era atomico ni segregable.
--
-- Uso esperado: el codigo Java hace
--    INSERT ... ON CONFLICT (document_type, year) DO UPDATE
--    SET last_value = document_code_counters.last_value + 1
--    RETURNING last_value;
-- y construye el codigo final como '<PREFIX>-<year>-<%04d last_value>'.

CREATE TABLE document_code_counters (
    document_type VARCHAR(30) NOT NULL,
    year          INTEGER     NOT NULL,
    last_value    BIGINT      NOT NULL DEFAULT 0,
    PRIMARY KEY (document_type, year)
);
