INSERT INTO document_templates (id, code, name, document_type, description, fields_schema) VALUES
(
    'a0000000-0000-0000-0000-000000000001',
    'ACTA_GENERAL',
    'Acta General de Reunión',
    'ACTA',
    'Acta estándar para registrar reuniones comunitarias',
    '{
        "fields": [
            {"key": "asistentes",      "label": "Asistentes",       "type": "textarea", "required": true,  "minLength": 5,  "searchable": true},
            {"key": "lugar",           "label": "Lugar",            "type": "text",     "required": true,  "maxLength": 200, "searchable": true},
            {"key": "hora_inicio",     "label": "Hora de inicio",   "type": "time",     "required": true},
            {"key": "hora_fin",        "label": "Hora de término",  "type": "time",     "required": false},
            {"key": "temas_tratados",  "label": "Temas tratados",   "type": "textarea", "required": true,  "minLength": 10, "searchable": true},
            {"key": "acuerdos",        "label": "Acuerdos",         "type": "textarea", "required": false, "searchable": true},
            {"key": "proxima_reunion", "label": "Próxima reunión",  "type": "date",     "required": false}
        ]
    }'::jsonb
),
(
    'a0000000-0000-0000-0000-000000000002',
    'INFORME_MENSUAL',
    'Informe Mensual de Actividades',
    'INFORME',
    'Informe periódico mensual del programa',
    '{
        "fields": [
            {"key": "periodo",      "label": "Período",                "type": "month",    "required": true,  "searchable": true},
            {"key": "resumen",      "label": "Resumen ejecutivo",      "type": "textarea", "required": true,  "minLength": 20, "searchable": true},
            {"key": "actividades",  "label": "Actividades realizadas", "type": "textarea", "required": true,  "minLength": 10},
            {"key": "indicadores",  "label": "Indicadores clave",      "type": "textarea", "required": false},
            {"key": "dificultades", "label": "Dificultades",           "type": "textarea", "required": false},
            {"key": "proyecciones", "label": "Proyecciones",           "type": "textarea", "required": false}
        ]
    }'::jsonb
),
(
    'a0000000-0000-0000-0000-000000000003',
    'OFICIO',
    'Oficio Institucional',
    'OFICIO',
    'Comunicación formal hacia organismos externos',
    '{
        "fields": [
            {"key": "destinatario",  "label": "Destinatario",   "type": "text",     "required": true,  "maxLength": 200, "searchable": true},
            {"key": "cargo",         "label": "Cargo",           "type": "text",     "required": false, "maxLength": 150},
            {"key": "institucion",   "label": "Institución",     "type": "text",     "required": false, "maxLength": 200, "searchable": true},
            {"key": "asunto",        "label": "Asunto",          "type": "text",     "required": true,  "maxLength": 300, "searchable": true},
            {"key": "cuerpo",        "label": "Cuerpo del oficio","type": "textarea","required": true,  "minLength": 20},
            {"key": "firma_cargo",   "label": "Cargo firmante",  "type": "text",     "required": false, "maxLength": 150}
        ]
    }'::jsonb
)
ON CONFLICT DO NOTHING;
