-- Modelo simplificado de roles (decisión de cliente):
--   1 = ADMINISTRADOR (revisa, aprueba, gestiona usuarios y plantillas)
--   2 = COLABORADOR   (crea actividades, redacta borradores y los envía a revisión)
INSERT INTO roles (id, name) VALUES
    (1, 'ADMINISTRADOR'),
    (2, 'COLABORADOR')
ON CONFLICT (id) DO UPDATE
    SET name = EXCLUDED.name;
