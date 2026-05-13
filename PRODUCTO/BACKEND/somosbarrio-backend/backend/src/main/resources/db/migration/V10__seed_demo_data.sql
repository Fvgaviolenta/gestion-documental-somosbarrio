-- Demo seed data — solo dev/test
-- Hashes BCrypt para password "Admin123!" (cost=10) generados con gen_salt
-- Roles: 1 = ADMINISTRADOR, 2 = COLABORADOR

INSERT INTO users (id, email, password_hash, first_name, last_name, is_active) VALUES
    ('00000000-0000-0000-0000-000000000001',
     'admin@somosbarrio.cl',
     crypt('Admin123!', gen_salt('bf', 10)),
     'Admin', 'Sistema', TRUE),
    ('00000000-0000-0000-0000-000000000002',
     'colaborador1@somosbarrio.cl',
     crypt('Admin123!', gen_salt('bf', 10)),
     'Carla', 'Ramírez', TRUE),
    ('00000000-0000-0000-0000-000000000003',
     'colaborador2@somosbarrio.cl',
     crypt('Admin123!', gen_salt('bf', 10)),
     'Pedro', 'González', TRUE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO user_roles (user_id, role_id) VALUES
    ('00000000-0000-0000-0000-000000000001', 1),  -- ADMINISTRADOR
    ('00000000-0000-0000-0000-000000000002', 2),  -- COLABORADOR
    ('00000000-0000-0000-0000-000000000003', 2)   -- COLABORADOR
ON CONFLICT DO NOTHING;

INSERT INTO activities (id, title, description, territory, start_date, end_date, status, created_by) VALUES
    ('10000000-0000-0000-0000-000000000001', 'Taller Prevención Comunitaria', 'Taller de prevención del delito sector norte', 'Viña del Mar Norte', '2026-04-10', '2026-04-10', 'FINALIZADA', '00000000-0000-0000-0000-000000000002'),
    ('10000000-0000-0000-0000-000000000002', 'Reunión Junta Vecinal', 'Reunión mensual con dirigentes vecinales', 'Viña del Mar Centro', '2026-04-15', '2026-04-15', 'FINALIZADA', '00000000-0000-0000-0000-000000000002'),
    ('10000000-0000-0000-0000-000000000003', 'Capacitación Autoprotección', 'Capacitación a vecinos en autoprotección', 'Viña del Mar Sur', '2026-04-20', '2026-04-21', 'FINALIZADA', '00000000-0000-0000-0000-000000000003'),
    ('10000000-0000-0000-0000-000000000004', 'Patrullaje Preventivo Abril', 'Patrullaje nocturno preventivo', 'Viña del Mar Poniente', '2026-04-25', NULL, 'EN_CURSO', '00000000-0000-0000-0000-000000000003'),
    ('10000000-0000-0000-0000-000000000005', 'Operativo Iluminación', 'Coordinación con municipio para mejorar iluminación', 'Viña del Mar Norte', '2026-05-01', '2026-05-03', 'PLANIFICADA', '00000000-0000-0000-0000-000000000002'),
    ('10000000-0000-0000-0000-000000000006', 'Feria Segura Barrio', 'Feria de seguridad barrial con stands', 'Viña del Mar Centro', '2026-05-05', '2026-05-05', 'PLANIFICADA', '00000000-0000-0000-0000-000000000002'),
    ('10000000-0000-0000-0000-000000000007', 'Diagnóstico Territorial Q2', 'Diagnóstico participativo segundo trimestre', 'Viña del Mar Sur', '2026-04-08', '2026-04-09', 'FINALIZADA', '00000000-0000-0000-0000-000000000003'),
    ('10000000-0000-0000-0000-000000000008', 'Taller Resolución Conflictos', 'Taller para líderes comunitarios', 'Viña del Mar Poniente', '2026-04-18', '2026-04-18', 'FINALIZADA', '00000000-0000-0000-0000-000000000002'),
    ('10000000-0000-0000-0000-000000000009', 'Mesa Intersectorial Mayo', 'Mesa de trabajo con instituciones', 'Viña del Mar Centro', '2026-05-08', NULL, 'PLANIFICADA', '00000000-0000-0000-0000-000000000002'),
    ('10000000-0000-0000-0000-000000000010', 'Plan Verano Seguro', 'Plan de actividades verano 2026-2027', 'Viña del Mar Norte', '2026-04-22', NULL, 'CANCELADA', '00000000-0000-0000-0000-000000000003')
ON CONFLICT (id) DO NOTHING;
