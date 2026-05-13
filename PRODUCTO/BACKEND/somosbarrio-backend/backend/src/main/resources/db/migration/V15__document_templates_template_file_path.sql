ALTER TABLE document_templates
    ADD COLUMN IF NOT EXISTS template_file_path VARCHAR(500);

COMMENT ON COLUMN document_templates.template_file_path IS 'Ruta relativa a TEMPLATE_ROOT del archivo .docx matriz (solo lectura en runtime).';
