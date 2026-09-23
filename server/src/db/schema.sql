-- =============================================================================
-- CONTRACT MANAGEMENT SYSTEM — MySQL 8+ Schema
-- Run via: node src/db/migrate.js
-- Or mounted as docker-entrypoint-initdb.d/01_schema.sql
-- =============================================================================

SET NAMES utf8mb4;
SET time_zone = '+00:00';

-- ─── 1. Authorization Allowlist ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS app_user_access (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  location_id   VARCHAR(64)  NOT NULL,
  ghl_user_id   VARCHAR(64)  NOT NULL,
  app_role      ENUM('SUPER_ADMIN','ADMIN','SALES') NOT NULL DEFAULT 'SALES',
  enabled       BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_location_user (location_id, ghl_user_id),
  INDEX idx_location (location_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── 2. Form Builder Schema ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contract_forms (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  location_id   VARCHAR(64)  NOT NULL,
  name          VARCHAR(255) NOT NULL,
  description   TEXT,
  schema_json   JSON         NOT NULL COMMENT 'Field definitions, types, GHL IDs, sources, validation, conditions',
  created_by    VARCHAR(64)  NOT NULL COMMENT 'GHL User ID of creator',
  created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_location (location_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── 3. Contract Templates ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contract_templates (
  id                     INT AUTO_INCREMENT PRIMARY KEY,
  location_id            VARCHAR(64)  NOT NULL,
  form_id                INT          NULL,
  name                   VARCHAR(255) NOT NULL,
  contract_type          VARCHAR(100) NOT NULL,
  current_version        INT          NOT NULL DEFAULT 1,
  is_active              BOOLEAN      NOT NULL DEFAULT TRUE,
  validity_days          INT          NOT NULL DEFAULT 7,
  document_schema_json   JSON         NOT NULL COMMENT 'Clause blocks, dynamic tokens, conditional sections',
  conditional_rules_json JSON         NULL     COMMENT 'Clause inclusion/exclusion logic (shared condition engine)',
  creation_rules_json    JSON         NULL     COMMENT 'Webhook opportunity matching criteria',
  signing_parties_json   JSON         NULL     COMMENT 'Signing party definitions (client, internal signatory)',
  created_at             TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at             TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (form_id) REFERENCES contract_forms(id) ON DELETE SET NULL,
  INDEX idx_location_type (location_id, contract_type),
  INDEX idx_location_active (location_id, is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── 4. Contract Template Version History ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS contract_template_versions (
  id                     INT AUTO_INCREMENT PRIMARY KEY,
  template_id            INT          NOT NULL,
  version_number         INT          NOT NULL,
  document_schema_json   JSON         NOT NULL,
  form_schema_snapshot   JSON         NULL,
  signing_parties_json   JSON         NULL,
  change_summary         TEXT         NULL,
  created_by             VARCHAR(64)  NOT NULL,
  created_at             TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_template_version (template_id, version_number),
  FOREIGN KEY (template_id) REFERENCES contract_templates(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── 5. Contract Instances ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contract_instances (
  id                   INT AUTO_INCREMENT PRIMARY KEY,
  location_id          VARCHAR(64)  NOT NULL,
  template_id          INT          NOT NULL,
  template_version     INT          NOT NULL,
  ghl_contact_id       VARCHAR(64)  NOT NULL,
  ghl_opportunity_id   VARCHAR(64)  NULL,
  assigned_user_id     VARCHAR(64)  NOT NULL COMMENT 'GHL User ID of assignee',
  created_by_user_id   VARCHAR(64)  NOT NULL COMMENT 'GHL User ID of creator',
  creation_mode        ENUM('AUTOMATIC','MANUAL') NOT NULL,
  state                ENUM(
    'AWAITING_FORM',
    'READY',
    'SENT',
    'VIEWED',
    'SIGNED',
    'SIGNED_PENDING_STORAGE',
    'COMPLETED',
    'EXPIRED',
    'CANCELLED',
    'DECLINED',
    'SUPERSEDED'
  ) NOT NULL DEFAULT 'AWAITING_FORM',
  form_response_json   JSON         NULL COMMENT 'Contract-local form values not synced to GHL',
  snapshot_json        JSON         NULL COMMENT 'Frozen immutable contract data captured at Send',
  signing_parties_json JSON         NULL COMMENT 'Per-party signing tokens, statuses, timestamps',
  signing_token        VARCHAR(128) NULL UNIQUE COMMENT 'Primary client signing token',
  token_expires_at     TIMESTAMP    NULL,
  viewed_at            TIMESTAMP    NULL,
  signed_at            TIMESTAMP    NULL,
  pdf_sha256           VARCHAR(64)  NULL,
  ghl_file_url         VARCHAR(512) NULL COMMENT 'GHL file URL after successful PDF upload',
  upload_retry_count   INT          NOT NULL DEFAULT 0,
  created_at           TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at           TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (template_id) REFERENCES contract_templates(id),
  INDEX idx_location_state   (location_id, state),
  INDEX idx_contact          (ghl_contact_id),
  INDEX idx_assigned_user    (assigned_user_id),
  INDEX idx_signing_token    (signing_token),
  INDEX idx_token_expires    (token_expires_at),
  INDEX idx_state_retry      (state, upload_retry_count)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── 6. Webhook Idempotency Keys ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS webhook_idempotency_keys (
  id                    INT AUTO_INCREMENT PRIMARY KEY,
  idempotency_key       VARCHAR(128) NOT NULL,
  contract_instance_id  INT          NULL,
  created_at            TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  expires_at            TIMESTAMP    NOT NULL,
  UNIQUE KEY uq_key (idempotency_key),
  INDEX idx_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── 7. Contract Audit Logs ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contract_audit_logs (
  id                    INT AUTO_INCREMENT PRIMARY KEY,
  contract_instance_id  INT          NOT NULL,
  actor_type            ENUM('USER','CLIENT','SYSTEM') NOT NULL,
  actor_id              VARCHAR(64)  NULL COMMENT 'GHL User ID, client token, or SYSTEM',
  actor_name            VARCHAR(255) NULL,
  action                VARCHAR(100) NOT NULL,
  from_state            VARCHAR(50)  NULL,
  to_state              VARCHAR(50)  NULL,
  ip_address            VARCHAR(45)  NULL,
  user_agent            TEXT         NULL,
  metadata_json         JSON         NULL,
  created_at            TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (contract_instance_id) REFERENCES contract_instances(id) ON DELETE CASCADE,
  INDEX idx_contract    (contract_instance_id),
  INDEX idx_created_at  (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── 8. System & Integration Settings ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS system_settings (
  setting_key   VARCHAR(128) PRIMARY KEY,
  setting_value TEXT         NULL,
  description   VARCHAR(255) NULL,
  is_secret     BOOLEAN      NOT NULL DEFAULT FALSE,
  category      VARCHAR(64)  NOT NULL DEFAULT 'GENERAL',
  updated_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

