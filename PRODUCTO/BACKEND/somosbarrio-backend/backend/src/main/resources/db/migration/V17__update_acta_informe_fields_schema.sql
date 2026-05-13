-- Actualiza fields_schema de plantillas municipales (claves alineadas con .docx / PLACEHOLDERS.txt).
-- ACTA: convocado_por, gestor_barrial, contraparte_spd; campo opcional foto_mesa_uuid (imagen en Word: sintaxis IMG dos puntos foto_mesa_uuid).
-- INFORME: orden de campos y foto_informe_uuid (imagen en Word: IMG dos puntos foto_informe_uuid).

UPDATE document_templates
SET fields_schema = $acta$
{
    "fields": [
        {"key": "numero_acta", "label": "Número de acta", "type": "text", "required": true},
        {"key": "proyecto", "label": "Proyecto", "type": "text", "required": true},
        {"key": "comuna", "label": "Comuna", "type": "text", "required": true},
        {"key": "barrio", "label": "Barrio", "type": "text", "required": true},
        {"key": "convocado_por", "label": "Convocado por", "type": "text", "required": false},
        {"key": "fecha_reunion", "label": "Fecha reunión", "type": "text", "required": true},
        {"key": "hora_inicio", "label": "Hora de inicio", "type": "text", "required": true},
        {"key": "hora_fin", "label": "Hora de término", "type": "text", "required": false},
        {"key": "lugar_reunion", "label": "Lugar de reunión", "type": "text", "required": true},
        {"key": "motivo_objetivo", "label": "Motivo y/u objetivo", "type": "textarea", "required": true},
        {"key": "resumen_temas", "label": "Resumen de temas tratados", "type": "textarea", "required": true},
        {"key": "compromisos", "label": "Compromisos y responsables", "type": "textarea", "required": false},
        {"key": "gestor_barrial", "label": "Gestor(a) barrial", "type": "text", "required": false},
        {"key": "contraparte_spd", "label": "Contraparte SPD", "type": "text", "required": false},
        {"key": "foto_mesa_uuid", "label": "UUID adjunto imagen / foto (opcional)", "type": "text", "required": false}
    ]
}
$acta$::jsonb
WHERE code = 'ACTA_MESA_COMUNITARIA';

UPDATE document_templates
SET fields_schema = $inf$
{
    "fields": [
        {"key": "numero_informe", "label": "Informe Nº / año", "type": "text", "required": true},
        {"key": "mat_asunto", "label": "MAT. (asunto)", "type": "textarea", "required": true},
        {"key": "fecha_ciudad", "label": "Ciudad y fecha", "type": "text", "required": true},
        {"key": "destinatario_a", "label": "A (destinatario)", "type": "textarea", "required": true},
        {"key": "remitente_de", "label": "DE (remitente)", "type": "textarea", "required": true},
        {"key": "cuerpo_intro", "label": "Cuerpo del informe", "type": "textarea", "required": true},
        {"key": "revisado_por", "label": "Revisado por", "type": "text", "required": false},
        {"key": "foto_informe_uuid", "label": "UUID adjunto imagen (opcional)", "type": "text", "required": false}
    ]
}
$inf$::jsonb
WHERE code = 'INFORME_TIPO';
