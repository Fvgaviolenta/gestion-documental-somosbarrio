-- Plantillas municipales para pruebas E2E (.docx en TEMPLATE_ROOT)
-- Desactiva las semillas genéricas duplicadas (siguen en BD por si hay referencias históricas)

UPDATE document_templates
SET is_active = FALSE
WHERE code IN ('ACTA_GENERAL', 'INFORME_MENSUAL');

INSERT INTO document_templates (id, code, name, document_type, description, fields_schema, template_file_path, is_active)
VALUES (
    'b0000000-0000-0000-0000-000000000011'::uuid,
    'ACTA_MESA_COMUNITARIA',
    'Acta de mesa comunitaria',
    'ACTA',
    'Plantilla municipal — mesa comunitaria (presencial o telemática)',
    '{
        "fields": [
            {"key": "numero_acta", "label": "Número de acta", "type": "text", "required": true},
            {"key": "proyecto", "label": "Proyecto", "type": "text", "required": true},
            {"key": "comuna", "label": "Comuna", "type": "text", "required": true},
            {"key": "barrio", "label": "Barrio", "type": "text", "required": true},
            {"key": "convocada_por", "label": "Reunión convocada por", "type": "text", "required": false},
            {"key": "fecha_reunion", "label": "Fecha reunión", "type": "text", "required": true},
            {"key": "hora_inicio", "label": "Hora de inicio", "type": "text", "required": true},
            {"key": "hora_fin", "label": "Hora de término", "type": "text", "required": false},
            {"key": "lugar_reunion", "label": "Lugar de reunión", "type": "text", "required": true},
            {"key": "motivo_objetivo", "label": "Motivo y/u objetivo", "type": "textarea", "required": true},
            {"key": "resumen_temas", "label": "Resumen de temas tratados", "type": "textarea", "required": true},
            {"key": "compromisos", "label": "Compromisos y responsables", "type": "textarea", "required": false}
        ]
    }'::jsonb,
    'ACTA_MESA_COMUNITARIA_TEMPLATE.docx',
    TRUE
),
(
    'b0000000-0000-0000-0000-000000000012'::uuid,
    'INFORME_TIPO',
    'Informe tipo',
    'INFORME',
    'Plantilla municipal — informe tipo',
    '{
        "fields": [
            {"key": "numero_informe", "label": "Informe Nº / año", "type": "text", "required": true},
            {"key": "mat_asunto", "label": "MAT. (asunto)", "type": "textarea", "required": true},
            {"key": "fecha_ciudad", "label": "Ciudad y fecha", "type": "text", "required": true},
            {"key": "destinatario_a", "label": "A (destinatario)", "type": "textarea", "required": true},
            {"key": "remitente_de", "label": "DE (remitente)", "type": "textarea", "required": true},
            {"key": "revisado_por", "label": "Revisado por", "type": "text", "required": false},
            {"key": "cuerpo_intro", "label": "Cuerpo del informe", "type": "textarea", "required": true}
        ]
    }'::jsonb,
    'INFORME_TEMPLATE.docx',
    TRUE
)
ON CONFLICT (code) DO NOTHING;
