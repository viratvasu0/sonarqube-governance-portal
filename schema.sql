CREATE TABLE IF NOT EXISTS repositories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    organization VARCHAR(255) DEFAULT 'wm-operations-sustainability',
    status VARCHAR(50) DEFAULT 'FAILED',
    properties_main BOOLEAN DEFAULT FALSE,
    properties_develop BOOLEAN DEFAULT FALSE,
    sonar_project_key VARCHAR(255) NOT NULL,
    primary_branch VARCHAR(50) DEFAULT 'main',
    has_develop BOOLEAN DEFAULT TRUE,
    main_scanned BOOLEAN DEFAULT FALSE,
    validation_details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    repo_name VARCHAR(255) NOT NULL,
    action VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL,
    details TEXT,
    executed_by VARCHAR(100) DEFAULT 'Vasu Addanki',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO repositories (name, status, properties_main, properties_develop, sonar_project_key, main_scanned, validation_details)
VALUES 
('ocs-obu-image-process', 'PASSED', true, true, 'wm-operations-sustainability_ocs-obu-image-process', true, 'Properties present on main & develop, Sonar project verified.'),
('ocs-rmda', 'PASSED', true, true, 'wm-operations-sustainability_ocs-rmda', true, 'Properties present on main & develop, Sonar project verified.'),
('ocs-data-tool', 'FAILED', true, false, 'wm-operations-sustainability_ocs-data-tool', false, 'sonar-project.properties missing on branch develop.'),
('OBUServices-AE', 'ACTION_REQUIRED', true, true, 'wm-operations-sustainability_OBUServices-AE', false, 'Project exists on SonarQube, master branch initial scan pending.')
ON CONFLICT (name) DO NOTHING;
