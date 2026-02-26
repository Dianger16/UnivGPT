-- ============================================
-- UniGPT Seed Data - 3 Sample Documents
-- Run after creating an admin user
-- ============================================

-- NOTE: Replace the admin UUID below with the actual admin profile ID after signup.
-- For local dev, we create a placeholder admin profile.

INSERT INTO profiles (id, email, full_name, role) VALUES
    ('00000000-0000-0000-0000-000000000001', 'admin@university.edu', 'System Admin', 'admin'),
    ('00000000-0000-0000-0000-000000000002', 'faculty@university.edu', 'Dr. Jane Smith', 'faculty'),
    ('00000000-0000-0000-0000-000000000003', 'student@university.edu', 'John Doe', 'student')
ON CONFLICT (id) DO NOTHING;

-- ─── Student Document ───
INSERT INTO documents (id, uploader_id, filename, storage_path, doc_type, department, course, tags, visibility) VALUES
(
    '10000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'student_handbook_2026.pdf',
    'documents/student/student_handbook_2026.pdf',
    'student',
    'General',
    'ALL',
    '["handbook", "policies", "student-life"]'::jsonb,
    true
);

INSERT INTO document_texts (id, document_id, chunk_index, content) VALUES
(
    '20000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    0,
    'Welcome to the University Student Handbook 2026. This handbook provides comprehensive information about academic policies, student services, campus life, and your rights and responsibilities as a student. All students are expected to maintain academic integrity and follow the university code of conduct.'
),
(
    '20000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000001',
    1,
    'Academic Calendar: The Fall semester begins on August 25, 2026 and ends on December 15, 2026. The Spring semester begins on January 15, 2027 and ends on May 10, 2027. Final exam periods are during the last two weeks of each semester. Students must register for courses before the add/drop deadline, which is typically two weeks after the semester start date.'
),
(
    '20000000-0000-0000-0000-000000000003',
    '10000000-0000-0000-0000-000000000001',
    2,
    'Grading Policy: The university uses a standard letter grade system (A, B, C, D, F) with plus/minus modifiers. A grade of C or better is required for major courses. Students who receive below a 2.0 GPA will be placed on academic probation. The Dean''s List recognizes students with a GPA of 3.5 or higher.'
);

-- ─── Faculty Document ───
INSERT INTO documents (id, uploader_id, filename, storage_path, doc_type, department, course, tags, visibility) VALUES
(
    '10000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'faculty_research_guidelines.pdf',
    'documents/faculty/faculty_research_guidelines.pdf',
    'faculty',
    'Research Office',
    'ALL',
    '["research", "grants", "IRB", "faculty-resources"]'::jsonb,
    true
);

INSERT INTO document_texts (id, document_id, chunk_index, content) VALUES
(
    '20000000-0000-0000-0000-000000000004',
    '10000000-0000-0000-0000-000000000002',
    0,
    'Faculty Research Guidelines 2026: All faculty research involving human subjects must receive IRB (Institutional Review Board) approval before data collection begins. The IRB review process typically takes 4-6 weeks for expedited reviews and 8-12 weeks for full board reviews. Faculty should budget for indirect costs at the university''s negotiated rate of 52%.'
),
(
    '20000000-0000-0000-0000-000000000005',
    '10000000-0000-0000-0000-000000000002',
    1,
    'Grant Submission Process: Faculty must submit grant proposals through the Office of Sponsored Research (OSR) at least 5 business days before the sponsor deadline. The OSR will review the budget, ensure compliance with sponsor guidelines, and submit on behalf of the PI. Internal seed grants of up to $25,000 are available annually through a competitive process.'
);

-- ─── Admin Document ───
INSERT INTO documents (id, uploader_id, filename, storage_path, doc_type, department, course, tags, visibility) VALUES
(
    '10000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    'it_security_policy.pdf',
    'documents/admin/it_security_policy.pdf',
    'admin',
    'IT',
    'ALL',
    '["security", "IT-policy", "compliance", "internal"]'::jsonb,
    true
);

INSERT INTO document_texts (id, document_id, chunk_index, content) VALUES
(
    '20000000-0000-0000-0000-000000000006',
    '10000000-0000-0000-0000-000000000003',
    0,
    'IT Security Policy (Internal - Admin Only): All university systems must implement multi-factor authentication by March 2026. System administrators must review access logs weekly and report any anomalies to the CISO within 24 hours. Data classified as Level 3 (PII, FERPA-protected) must be encrypted at rest and in transit using AES-256 encryption.'
),
(
    '20000000-0000-0000-0000-000000000007',
    '10000000-0000-0000-0000-000000000003',
    1,
    'Incident Response Plan: In the event of a data breach, the IT Security team must be notified within 1 hour. The incident response team will classify the severity (Low/Medium/High/Critical) and notify affected parties within 72 hours as required by FERPA and state data breach notification laws. Annual penetration testing is mandatory for all public-facing systems.'
);

-- ─── Sample Audit Log Entries ───
INSERT INTO audit_logs (user_id, action, payload) VALUES
('00000000-0000-0000-0000-000000000001', 'document_upload', '{"filename": "student_handbook_2026.pdf", "doc_type": "student"}'::jsonb),
('00000000-0000-0000-0000-000000000001', 'document_upload', '{"filename": "faculty_research_guidelines.pdf", "doc_type": "faculty"}'::jsonb),
('00000000-0000-0000-0000-000000000001', 'document_upload', '{"filename": "it_security_policy.pdf", "doc_type": "admin"}'::jsonb);
