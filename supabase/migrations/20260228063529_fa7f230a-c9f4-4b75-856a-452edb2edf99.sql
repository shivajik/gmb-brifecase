UPDATE pages 
SET content = '[{"id":"form","type":"component","data":{"component":"ContactForm"}},{"id":"info","type":"component","data":{"component":"ContactInfo"}}]'::jsonb
WHERE slug = 'contact';