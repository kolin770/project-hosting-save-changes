import { useCallback, useEffect, useState } from 'react'
import {
  Activity,
  ArrowRight,
  Check,
  CheckCircle2,
  Code2,
  Copy,
  Database,
  ExternalLink,
  FileCode2,
  Globe,
  KeyRound,
  Layers,
  Lock,
  Play,
  Plus,
  RefreshCw,
  Server,
  ShieldCheck,
  Terminal,
  Trash2,
  Workflow,
} from 'lucide-react'
import type { PageRoute } from '@/components/Navbar'

type CodeTabId = 'mysql' | 'php' | 'python' | 'frontend'

interface SandboxInstance {
  id: string
  name: string
  genericDomain: string
  baseZone: string
  stack: string
  isolationMode: string
  containerId: string
  privateIp: string
  mysqlDatabase: string
  mysqlUser: string
  accessToken: string
  ttlHours: number
  status: 'isolated_active' | 'terminated'
  createdAt: string
}

interface CodeArtifact {
  id: CodeTabId
  label: string
  filename: string
  techBadge: string
  description: string
  code: string
}

const codeArtifacts: CodeArtifact[] = [
  {
    id: 'mysql',
    label: 'מסד נתונים MySQL 8.0',
    filename: 'sandbox/database/isolated_schema.sql',
    techBadge: 'MySQL 8.0 · InnoDB',
    description:
      'סכמת מסד נתונים מנורמלת לסביבת ה-Secured SandBox: ניהול לקוחות, אימות דו-שלבי (TOTP), מנויי אחסון ותור משימות אוטומציה ל-Python.',
    code: `-- ============================================================================
-- Secured SandBox | Isolated Relational Schema (MySQL 8.0)
-- Engine: InnoDB | Charset: utf8mb4_unicode_ci
-- ============================================================================

CREATE DATABASE IF NOT EXISTS sbx_isolated_core
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE sbx_isolated_core;

-- 1. טבלת לקוחות ואימות דו-שלבי (2FA Google Authenticator)
CREATE TABLE clients (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    client_uuid CHAR(36) NOT NULL UNIQUE,
    email VARCHAR(190) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL COMMENT 'Argon2id hash',
    full_name VARCHAR(120) NOT NULL,
    company_name VARCHAR(150) DEFAULT NULL,
    phone VARCHAR(32) NOT NULL,
    totp_secret VARCHAR(64) DEFAULT NULL COMMENT 'Encrypted Base32 RFC 6238 secret',
    totp_enabled TINYINT(1) NOT NULL DEFAULT 0,
    account_status ENUM('active', 'suspended', 'pending_verification') NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_clients_email (email),
    INDEX idx_clients_status (account_status)
) ENGINE=InnoDB;

-- 2. טבלת שרתי אחסון (Nodes) במרכזי הנתונים
CREATE TABLE server_nodes (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    hostname VARCHAR(120) NOT NULL UNIQUE,
    ip_address VARCHAR(45) NOT NULL,
    datacenter_region ENUM('IL-PTK', 'EU-FRA', 'US-NYC') NOT NULL DEFAULT 'IL-PTK',
    os_type VARCHAR(60) NOT NULL DEFAULT 'CloudLinux 9 + LiteSpeed Enterprise',
    cpu_load DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    ram_used_pct DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    nvme_used_pct DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    is_healthy TINYINT(1) NOT NULL DEFAULT 1,
    last_heartbeat_at TIMESTAMP NULL DEFAULT NULL
) ENGINE=InnoDB;

-- 3. טבלת מנויי אחסון (NVMe / WordPress / WooCommerce)
CREATE TABLE hosting_subscriptions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    client_id BIGINT UNSIGNED NOT NULL,
    node_id INT UNSIGNED NOT NULL,
    plan_code VARCHAR(64) NOT NULL,
    primary_domain VARCHAR(190) NOT NULL,
    system_username VARCHAR(32) NOT NULL UNIQUE,
    dedicated_ram_gb TINYINT UNSIGNED NOT NULL DEFAULT 4,
    nvme_quota_gb SMALLINT UNSIGNED NOT NULL DEFAULT 50,
    billing_cycle ENUM('monthly', 'annual') NOT NULL DEFAULT 'annual',
    price_ils DECIMAL(10,2) NOT NULL,
    next_due_date DATE NOT NULL,
    status ENUM('provisioning', 'active', 'suspended', 'cancelled') NOT NULL DEFAULT 'provisioning',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sub_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE RESTRICT,
    CONSTRAINT fk_sub_node FOREIGN KEY (node_id) REFERENCES server_nodes(id) ON DELETE RESTRICT,
    INDEX idx_sub_domain (primary_domain),
    INDEX idx_sub_status (status)
) ENGINE=InnoDB;

-- 4. תור משימות אוטומציה עבור שירות ה-Python הפנימי (Provisioning & WHOIS)
CREATE TABLE automation_jobs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    job_type ENUM('PROVISION_ACCOUNT', 'ISSUE_SSL', 'WHOIS_SYNC', 'WIREGUARD_PEER', 'JETBACKUP_RESTORE') NOT NULL,
    payload_json JSON NOT NULL,
    status ENUM('queued', 'processing', 'completed', 'failed') NOT NULL DEFAULT 'queued',
    worker_id VARCHAR(64) DEFAULT NULL,
    result_log TEXT DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL DEFAULT NULL,
    INDEX idx_jobs_status_type (status, job_type)
) ENGINE=InnoDB;`,
  },
  {
    id: 'php',
    label: 'בקאנד PHP 8.3 (PDO + CSRF)',
    filename: 'sandbox/api/SandboxProvisioningController.php',
    techBadge: 'PHP 8.3 · Strict Types · PDO',
    description:
      'מחלקת API ב-PHP 8.3 הרצה בתוך ה-Secured SandBox עם אימות מפתח סביבה מבודד, X-CSRF-TOKEN וטרנזקציות PDO.',
    code: `<?php
declare(strict_types=1);

namespace Sandbox\\Isolated\\Controllers;

use PDO;
use PDOException;
use RuntimeException;

final class SandboxProvisioningController
{
    private PDO $db;

    public function __construct(string $dsn, string $dbUser, string $dbPass)
    {
        $this->db = new PDO($dsn, $dbUser, $dbPass, [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]);
    }

    /**
     * אימות כפול: X-CSRF-TOKEN + X-Sandbox-Token של הסביבה המבודדת
     */
    private function assertSandboxSecurity(): void
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        $headerCsrf  = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
        $sessionCsrf = $_SESSION['csrf_token'] ?? '';
        $sandboxKey  = $_SERVER['HTTP_X_SANDBOX_TOKEN'] ?? '';
        $expectedKey = getenv('SANDBOX_ACCESS_TOKEN') ?: '';

        if (
            $headerCsrf === '' ||
            !hash_equals($sessionCsrf, $headerCsrf) ||
            ($expectedKey !== '' && !hash_equals($expectedKey, $sandboxKey))
        ) {
            http_response_code(403);
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode([
                'ok'    => false,
                'error' => 'גישה לסביבת ה-Secured SandBox נדחתה (CSRF / Sandbox Token Invalid).',
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }

    public function createHostingSubscription(array $input): void
    {
        $this->assertSandboxSecurity();

        $clientId = (int)($input['client_id'] ?? 0);
        $domain   = strtolower(trim((string)($input['domain'] ?? '')));
        $planCode = trim((string)($input['plan_code'] ?? 'nvme_prime_2'));
        $nodeId   = (int)($input['node_id'] ?? 1);

        if ($clientId <= 0 || !preg_match('/^[a-z0-9.-]+\\.[a-z]{2,}$/', $domain)) {
            http_response_code(422);
            echo json_encode(['ok' => false, 'error' => 'נתוני לקוח או דומיין לא תקינים'], JSON_UNESCAPED_UNICODE);
            return;
        }

        $sysUser = 'sbx_' . substr(preg_replace('/[^a-z0-9]/', '', $domain), 0, 8) . random_int(100, 999);

        try {
            $this->db->beginTransaction();

            $stmt = $this->db->prepare("
                INSERT INTO hosting_subscriptions
                  (client_id, node_id, plan_code, primary_domain, system_username, dedicated_ram_gb, nvme_quota_gb, billing_cycle, price_ils, next_due_date, status)
                VALUES
                  (:client_id, :node_id, :plan_code, :domain, :sys_user, 4, 50, 'annual', 63.00, DATE_ADD(CURDATE(), INTERVAL 1 YEAR), 'provisioning')
            ");
            $stmt->execute([
                ':client_id' => $clientId,
                ':node_id'   => $nodeId,
                ':plan_code' => $planCode,
                ':domain'    => $domain,
                ':sys_user'  => $sysUser,
            ]);

            $subscriptionId = (int)$this->db->lastInsertId();

            $jobStmt = $this->db->prepare("
                INSERT INTO automation_jobs (job_type, payload_json, status)
                VALUES ('PROVISION_ACCOUNT', :payload, 'queued')
            ");
            $jobStmt->execute([
                ':payload' => json_encode([
                    'subscription_id' => $subscriptionId,
                    'domain'          => $domain,
                    'system_username' => $sysUser,
                    'plan_code'       => $planCode,
                    'php_version'     => '8.3',
                    'enable_redis'    => true,
                ], JSON_THROW_ON_ERROR),
            ]);

            $this->db->commit();

            header('Content-Type: application/json; charset=utf-8');
            echo json_encode([
                'ok'              => true,
                'subscription_id' => $subscriptionId,
                'system_username' => $sysUser,
                'status'          => 'queued_for_python_worker',
            ], JSON_UNESCAPED_UNICODE);
        } catch (PDOException $e) {
            $this->db->rollBack();
            throw new RuntimeException('Database transaction failed: ' . $e->getMessage());
        }
    }
}`,
  },
  {
    id: 'python',
    label: 'אוטומציה Python 3.12 + MySQL',
    filename: 'sandbox/workers/sandbox_worker.py',
    techBadge: 'Python 3.12 · Isolated Worker',
    description:
      'שירות Python 3.12 הרץ בתוך רשת ה-Sandbox הפנימית (10.244.x.x), מושך משימות מ-MySQL ומבצע הקמת קונטיינרים ובדיקות אבטחה.',
    code: `#!/usr/bin/env python3
"""
Secured SandBox | Isolated Automation Worker (Python 3.12)
Runs inside isolated network namespace (10.244.0.0/16) and polls MySQL 8.0 queue.
"""

import json
import os
import time
import logging
import requests
import mysql.connector
from mysql.connector import Error as MySQLError

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] [Sandbox-Worker] %(message)s"
)

DB_CONFIG = {
    "host": os.environ.get("SANDBOX_MYSQL_HOST", "10.244.18.12"),
    "user": os.environ.get("SANDBOX_MYSQL_USER", "sbx_usr_7f9a"),
    "password": os.environ.get("SANDBOX_MYSQL_PASSWORD", ""),
    "database": os.environ.get("SANDBOX_MYSQL_DB", "sbx_db_7f9a2c"),
    "autocommit": False,
}


def process_provisioning_job(cursor, job_id: int, payload: dict) -> str:
    sub_id = payload["subscription_id"]
    domain = payload["domain"]
    sys_user = payload["system_username"]

    logging.info("Provisioning isolated container for %s (user=%s)...", domain, sys_user)

    cursor.execute(
        """
        UPDATE hosting_subscriptions
        SET status = 'active'
        WHERE id = %s
        """,
        (sub_id,),
    )
    return f"Sandbox container {sys_user} ({domain}) active with PHP {payload.get('php_version', '8.3')}."


def poll_queue_once() -> None:
    conn = mysql.connector.connect(**DB_CONFIG)
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT id, job_type, payload_json
            FROM automation_jobs
            WHERE status = 'queued'
            ORDER BY id ASC
            LIMIT 1
            FOR UPDATE SKIP LOCKED
            """
        )
        job = cursor.fetchone()
        if not job:
            conn.rollback()
            return

        job_id = job["id"]
        payload = json.loads(job["payload_json"])

        cursor.execute(
            "UPDATE automation_jobs SET status = 'processing', worker_id = 'py-sbx-01' WHERE id = %s",
            (job_id,),
        )
        conn.commit()

        result_msg = process_provisioning_job(cursor, job_id, payload)

        cursor.execute(
            """
            UPDATE automation_jobs
            SET status = 'completed', result_log = %s, completed_at = NOW()
            WHERE id = %s
            """,
            (result_msg, job_id),
        )
        conn.commit()
        logging.info("Job #%d completed: %s", job_id, result_msg)
    except (MySQLError, Exception) as exc:
        conn.rollback()
        logging.error("Worker exception: %s", exc)
    finally:
        conn.close()


if __name__ == "__main__":
    logging.info("Isolated Python 3.12 Sandbox Worker started.")
    while True:
        poll_queue_once()
        time.sleep(2)`,
  },
  {
    id: 'frontend',
    label: 'חיבור React Frontend לדומיין ה-Sandbox',
    filename: 'sandbox/frontend/sandboxClient.ts',
    techBadge: 'TypeScript · Generic Sandbox Domain',
    description:
      'קליינט Frontend המתחבר אך ורק לדומיין הגנרי של ה-Secured SandBox (למשל https://sbx-7f9a2c10.sbx-cloud-dev.net) עם X-CSRF-TOKEN ו-X-Sandbox-Token.',
    code: `// ============================================================================
// Secured SandBox Frontend Client (Bound to Generic Isolated Domain)
// ============================================================================

const SANDBOX_BASE_URL =
  import.meta.env.VITE_SANDBOX_DOMAIN || 'https://sbx-7f9a2c10.sbx-cloud-dev.net'

export interface SandboxProvisionRequest {
  client_id: number
  domain: string
  plan_code: 'nvme_prime_1' | 'nvme_prime_2' | 'wp_pro' | 'woo_scale'
  node_id: number
}

export async function callIsolatedSandboxApi(
  endpoint: string,
  sandboxAccessToken: string,
  csrfToken: string,
  body: unknown,
) {
  const response = await fetch(\`\${SANDBOX_BASE_URL}\${endpoint}\`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-TOKEN': csrfToken,
      'X-Sandbox-Token': sandboxAccessToken,
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.error || \`Sandbox HTTP Error \${response.status}\`)
  }

  return response.json()
}`,
  },
]

const DEFAULT_SANDBOX: SandboxInstance = {
  id: 'sbx-7f9a2c10',
  name: 'Core Billing & CRM Sandbox',
  genericDomain: 'https://sbx-7f9a2c10.sbx-cloud-dev.net',
  baseZone: 'sbx-cloud-dev.net',
  stack: 'PHP 8.3-FPM + MySQL 8.0 + Python 3.12 Worker',
  isolationMode: 'Zero-Trust mTLS + Network Namespace Isolation',
  containerId: 'lxc-sbx-7f9a2c10',
  privateIp: '10.244.18.12',
  mysqlDatabase: 'sbx_db_7f9a2c',
  mysqlUser: 'sbx_usr_7f9a',
  accessToken: 'sbx_live_98c4f1a0b3e7d2194f8a',
  ttlHours: 24,
  status: 'isolated_active',
  createdAt: new Date().toISOString(),
}

export function InternalSystemsPage({
  onNavigate,
}: {
  onNavigate: (page: PageRoute, href?: string) => void
}) {
  const [sandboxes, setSandboxes] = useState<SandboxInstance[]>([DEFAULT_SANDBOX])
  const [selectedSandboxId, setSelectedSandboxId] = useState<string>(DEFAULT_SANDBOX.id)
  const [csrfToken, setCsrfToken] = useState<string>('')
  const [creating, setCreating] = useState(false)

  // New Sandbox Form State
  const [envName, setEnvName] = useState('Internal ERP & Provisioning v2')
  const [customPrefix, setCustomPrefix] = useState('core-dev')
  const [baseZone, setBaseZone] = useState('sbx-cloud-dev.net')
  const [stack, setStack] = useState('PHP 8.3-FPM + MySQL 8.0 + Python 3.12 Worker')
  const [ttlHours, setTtlHours] = useState(24)

  // Code Inspector State
  const [activeTab, setActiveTab] = useState<CodeTabId>('mysql')
  const [copiedField, setCopiedField] = useState<string | null>(null)

  // GitHub Direct Push State
  const [ghRepo, setGhRepo] = useState('kolin770/project-hosting')
  const [ghBranch, setGhBranch] = useState('main')
  const [ghToken, setGhToken] = useState('')
  const [ghPushing, setGhPushing] = useState(false)
  const [ghResult, setGhResult] = useState<{
    ok: boolean
    message: string
    repoUrl?: string
  } | null>(null)

  const handleDirectGitHubPush = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ghToken.trim() || ghPushing) return
    setGhPushing(true)
    setGhResult(null)
    try {
      let token = csrfToken
      if (!token) {
        const r = await fetch('/api/csrf-token')
        const d = (await r.json()) as { csrfToken?: string }
        token = d.csrfToken || ''
        setCsrfToken(token)
      }
      const resp = await fetch('/api/github/push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': token,
        },
        body: JSON.stringify({
          githubToken: ghToken.trim(),
          repo: ghRepo.trim(),
          branch: ghBranch.trim() || 'main',
        }),
      })
      const data = (await resp.json()) as {
        ok?: boolean
        commitHash?: string
        repoUrl?: string
        error?: string
      }
      if (!resp.ok || !data.ok) {
        setGhResult({
          ok: false,
          message: data.error || 'שגיאה בדחיפת הקוד ל-GitHub',
        })
      } else {
        setGhToken('') // Clear token from memory immediately after push
        setGhResult({
          ok: true,
          message: `הקוד נדחף בהצלחה לענף ${ghBranch} (Commit: ${data.commitHash})!`,
          repoUrl: data.repoUrl,
        })
      }
    } catch {
      setGhResult({
        ok: false,
        message: 'שגיאת תקשורת בביצוע הדחיפה ל-GitHub',
      })
    } finally {
      setGhPushing(false)
    }
  }

  const fetchInitialData = useCallback(async () => {
    try {
      const [csrfRes, sbxRes] = await Promise.all([
        fetch('/api/csrf-token'),
        fetch('/api/sandbox/environments'),
      ])
      const csrfData = (await csrfRes.json()) as { csrfToken?: string }
      if (csrfData.csrfToken) setCsrfToken(csrfData.csrfToken)

      const sbxData = (await sbxRes.json()) as { environments?: SandboxInstance[] }
      if (sbxData.environments && sbxData.environments.length > 0) {
        setSandboxes(sbxData.environments)
        setSelectedSandboxId((prev) => prev || sbxData.environments![0].id)
      }
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    fetchInitialData()
  }, [fetchInitialData])

  const handleCreateSandbox = async (e: React.FormEvent) => {
    e.preventDefault()
    if (creating) return
    setCreating(true)
    try {
      let token = csrfToken
      if (!token) {
        const r = await fetch('/api/csrf-token')
        const d = (await r.json()) as { csrfToken?: string }
        token = d.csrfToken || ''
        setCsrfToken(token)
      }

      const resp = await fetch('/api/sandbox/provision', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': token,
        },
        body: JSON.stringify({
          name: envName,
          customPrefix,
          baseZone,
          stack,
          ttlHours,
        }),
      })
      const data = (await resp.json()) as { ok?: boolean; sandbox?: SandboxInstance }
      if (data.ok && data.sandbox) {
        setSandboxes((prev) => [data.sandbox!, ...prev])
        setSelectedSandboxId(data.sandbox.id)
      }
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteSandbox = async (id: string) => {
    try {
      await fetch(`/api/sandbox/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: {
          'X-CSRF-TOKEN': csrfToken,
        },
      })
      setSandboxes((prev) => {
        const next = prev.filter((s) => s.id !== id)
        if (selectedSandboxId === id) {
          setSelectedSandboxId(next[0]?.id || '')
        }
        return next
      })
    } catch {
      // ignore
    }
  }

  const handleCopy = (key: string, value: string) => {
    navigator.clipboard.writeText(value)
    setCopiedField(key)
    setTimeout(() => setCopiedField(null), 1800)
  }

  const activeSandbox = sandboxes.find((s) => s.id === selectedSandboxId) ?? sandboxes[0]
  const currentArtifact = codeArtifacts.find((a) => a.id === activeTab) ?? codeArtifacts[0]

  return (
    <div className="pb-24">
      {/* Top Security Classification Bar */}
      <div className="border-b border-emerald-500/25 bg-emerald-950/30 px-4 py-2.5 text-xs">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-mono text-emerald-300" dir="ltr">
            <Lock className="h-3.5 w-3.5" />
            <span>SECURED SANDBOX ENVIRONMENT · UNLISTED PRIVATE GATEWAY (NOINDEX / NOFOLLOW)</span>
          </div>
          <div className="text-slate-300">
            סביבה זו מופרדת לחלוטין מהאתר הציבורי ואינה חשופה בתפריטים או בפוטר הציבורי.
          </div>
        </div>
      </div>

      {/* Header */}
      <section className="relative border-b border-white/10 pb-12 pt-8 sm:pt-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => onNavigate('client-portal', '#client-portal')}
              className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium text-slate-300 transition-colors hover:text-cyan-300"
            >
              <ArrowRight className="h-4 w-4" />
              חזרה לפורטל הלקוחות המאובטח
            </button>

            <a
              href="#secured-sandbox"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:border-cyan-400/40 hover:text-white"
            >
              <ExternalLink className="h-3.5 w-3.5 text-cyan-300" />
              <span>פתח סביבת SandBox בחלון נפרד (_blank)</span>
            </a>
          </div>

          <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[1.15fr_1fr]">
            <div>
              <p
                dir="ltr"
                className="font-mono text-xs font-bold tracking-widest text-emerald-400 uppercase"
              >
                ISOLATED SINGLE-TENANT DEV ENVIRONMENT · SECURED SANDBOX
              </p>
              <h1 className="mt-2.5 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
                הקמת סביבת פיתוח מבודדת{' '}
                <span className="bg-gradient-to-l from-emerald-300 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
                  Secured SandBox
                </span>
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
                מנוע להקמת סביבת פיתוח בודדה, מוצפנת ומבודדת על גבי{' '}
                <strong className="text-white">דומיין גנרי ייעודי</strong> (ללא קשר לדומיין הציבורי
                של החברה). כל סביבה מקבלת קונטיינר LXC עצמאי, רשת פנימית מבודדת, מסד נתונים{' '}
                <strong>MySQL 8.0</strong> פרטי, <strong>PHP 8.3-FPM</strong> ו-
                <strong>Python 3.12 Worker</strong>.
              </p>

              {/* Active Generic Sandbox Domain Banner */}
              {activeSandbox && (
                <div className="mt-6 rounded-2xl border border-emerald-400/35 bg-slate-900/90 p-5 shadow-xl">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                      <ShieldCheck className="h-4 w-4" />
                      <span>דומיין גנרי פעיל לסביבה מבודדת (Isolated Generic Domain):</span>
                    </span>
                    <span className="rounded border border-emerald-400/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-[11px] font-bold text-emerald-300">
                      ZERO-TRUST ISOLATED
                    </span>
                  </div>

                  <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div
                      dir="ltr"
                      className="truncate rounded-xl border border-white/10 bg-slate-950 px-4 py-3 font-mono text-base font-extrabold text-cyan-300 sm:text-lg"
                    >
                      {activeSandbox.genericDomain}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopy('domain', activeSandbox.genericDomain)}
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-xs font-bold text-white hover:bg-white/10"
                      >
                        {copiedField === 'domain' ? (
                          <>
                            <Check className="h-4 w-4 text-emerald-400" />
                            <span className="text-emerald-300">הדומיין הועתק</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 text-cyan-300" />
                            <span>העתק דומיין גנרי</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2.5 border-t border-white/10 pt-3.5 text-xs sm:grid-cols-4">
                    <div>
                      <span className="text-slate-400">Container ID:</span>
                      <div className="font-mono font-bold text-white" dir="ltr">
                        {activeSandbox.containerId}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400">Isolated Subnet IP:</span>
                      <div className="font-mono font-bold text-cyan-300" dir="ltr">
                        {activeSandbox.privateIp}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400">Ephemeral MySQL DB:</span>
                      <div className="font-mono font-bold text-white" dir="ltr">
                        {activeSandbox.mysqlDatabase}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400">Auto-Destroy TTL:</span>
                      <div className="font-mono font-bold text-emerald-300" dir="ltr">
                        {activeSandbox.ttlHours}h Isolated
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Card: Spin Up New Isolated Generic Domain Sandbox */}
            <div className="rounded-2xl border border-white/15 bg-slate-900/90 p-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <Plus className="h-5 w-5 text-cyan-300" />
                  <h2 className="text-base font-extrabold text-white">
                    הקמת סביבת Secured SandBox חדשה
                  </h2>
                </div>
                <span className="font-mono text-[11px] text-cyan-300" dir="ltr">
                  LXC + mTLS
                </span>
              </div>

              <form onSubmit={handleCreateSandbox} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300">
                    שם הפרויקט / המערכת הפנימית
                  </label>
                  <input
                    type="text"
                    required
                    value={envName}
                    onChange={(e) => setEnvName(e.target.value)}
                    placeholder="למשל: Internal Billing & Automation"
                    className="mt-1.5 w-full rounded-xl border border-white/15 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300">
                      קידומת תת-דומיין (Prefix)
                    </label>
                    <input
                      type="text"
                      dir="ltr"
                      value={customPrefix}
                      onChange={(e) => setCustomPrefix(e.target.value)}
                      placeholder="core-dev"
                      className="mt-1.5 w-full rounded-xl border border-white/15 bg-slate-950 px-3.5 py-2.5 text-left font-mono text-sm text-white focus:border-cyan-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300">
                      דומיין גנרי מבודד (Base Zone)
                    </label>
                    <select
                      dir="ltr"
                      value={baseZone}
                      onChange={(e) => setBaseZone(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-white/15 bg-slate-950 px-3.5 py-2.5 font-mono text-xs text-cyan-300 focus:border-cyan-400 focus:outline-none sm:text-sm"
                    >
                      <option value="sbx-cloud-dev.net">*.sbx-cloud-dev.net</option>
                      <option value="isolated-stage.org">*.isolated-stage.org</option>
                      <option value="dev-sandbox-il.net">*.dev-sandbox-il.net</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300">
                      הרכב קונטיינר (Isolated Stack)
                    </label>
                    <select
                      dir="ltr"
                      value={stack}
                      onChange={(e) => setStack(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-white/15 bg-slate-950 px-3.5 py-2.5 font-mono text-xs text-white focus:border-cyan-400 focus:outline-none"
                    >
                      <option value="PHP 8.3-FPM + MySQL 8.0 + Python 3.12 Worker">
                        PHP 8.3 + MySQL 8.0 + Python 3.12
                      </option>
                      <option value="Python 3.12 FastAPI + MySQL 8.0 + Redis 7">
                        Python 3.12 FastAPI + MySQL 8.0
                      </option>
                      <option value="PHP 8.3 Strict PDO + MariaDB 10.11">
                        PHP 8.3 PDO + MariaDB 10.11
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300">
                      זמן השמדה אוטומטי (TTL)
                    </label>
                    <select
                      value={ttlHours}
                      onChange={(e) => setTtlHours(Number(e.target.value))}
                      className="mt-1.5 w-full rounded-xl border border-white/15 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-cyan-400 focus:outline-none"
                    >
                      <option value={4}>4 שעות (Ephemeral)</option>
                      <option value={12}>12 שעות</option>
                      <option value={24}>24 שעות</option>
                      <option value={168}>7 ימים (סביבת פיתוח מתמשכת)</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={creating}
                  className="mt-2 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-emerald-400 via-cyan-500 to-blue-600 py-3.5 text-sm font-extrabold text-slate-950 shadow-lg shadow-cyan-500/20 transition-all hover:shadow-cyan-400/40 disabled:opacity-60"
                >
                  {creating ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>מקצה קונטיינר ודומיין גנרי מבודד...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4" />
                      <span>הקם סביבת Secured SandBox מבודדת</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* 1-Click GitHub Direct Push & Production ZIP Export */}
      <section className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-cyan-400/35 bg-slate-900/90 p-6 shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <span className="font-mono text-xs font-bold text-cyan-300 uppercase" dir="ltr">
                GITHUB FORCE PUSH & AUTO-PUBLISH ENGINE (NO SOFTWARE REQUIRED)
              </span>
              <h2 className="mt-1 text-xl font-extrabold text-white">
                דחיפה ישירה ו-Publish אוטומטי ל-GitHub (`lev-tech.net`) — ללא צורך בהתקנת תוכנה
              </h2>
              <p className="mt-1 text-xs text-slate-300">
                דוחף בפקודה אחת (`git push --force`) גם ל-
                <code className="mx-1 rounded bg-slate-950 px-1.5 py-0.5 text-cyan-300" dir="ltr">
                  kolin770/project-hosting
                </code>
                וגם ל-
                <code className="mx-1 rounded bg-slate-950 px-1.5 py-0.5 text-cyan-300" dir="ltr">
                  kolin770/project-hosting-save-changes
                </code>
                ומפעיל אוטומטית GitHub Actions Publish עבור <strong className="text-white">lev-tech.net</strong>.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <a
                href="/api/export/netlify-dist.zip"
                download="lev-tech-net-production-dist.zip"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-extrabold text-slate-950 shadow-lg shadow-emerald-500/20 transition-transform hover:scale-105"
              >
                <ExternalLink className="h-4 w-4" />
                <span>הורד גרסת Production מקומפלת (dist.zip)</span>
              </a>
              <a
                href="/api/export/project.zip"
                download="lev-tech-hosting-production.zip"
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/40 bg-emerald-500/15 px-4 py-2.5 text-xs font-extrabold text-emerald-300 transition-colors hover:bg-emerald-500/25 hover:text-white"
              >
                <ExternalLink className="h-4 w-4" />
                <span>הורד קוד מקור מלא ל-GitHub (Source ZIP)</span>
              </a>
            </div>
          </div>

          <form
            onSubmit={handleDirectGitHubPush}
            className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-4"
          >
            <div>
              <label className="block text-xs font-semibold text-slate-300">
                מאגר יעד ב-GitHub (מסנכרן את שניהם אוטומטית)
              </label>
              <input
                type="text"
                dir="ltr"
                required
                value={ghRepo}
                onChange={(e) => setGhRepo(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-white/15 bg-slate-950 px-3.5 py-2.5 text-left font-mono text-sm text-white focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300">ענף (Branch)</label>
              <input
                type="text"
                dir="ltr"
                required
                value={ghBranch}
                onChange={(e) => setGhBranch(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-white/15 bg-slate-950 px-3.5 py-2.5 text-left font-mono text-sm text-white focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between gap-2">
                <label className="block text-xs font-semibold text-slate-300">
                  GitHub Token (`ghp_...`)
                </label>
                <a
                  href="https://github.com/settings/tokens/new?scopes=repo,workflow&description=LevTech-Force-Publish"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-bold text-cyan-300 underline hover:text-white"
                >
                  צור טוקן ב-2 שניות ↗
                </a>
              </div>
              <input
                type="password"
                dir="ltr"
                required
                value={ghToken}
                onChange={(e) => setGhToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                className="mt-1.5 w-full rounded-xl border border-white/15 bg-slate-950 px-3.5 py-2.5 text-left font-mono text-sm text-white focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={ghPushing}
                className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-cyan-400 to-blue-600 py-2.5 text-sm font-extrabold text-white shadow-lg shadow-cyan-500/25 transition-all hover:shadow-cyan-400/40 disabled:opacity-60"
              >
                {ghPushing ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>כופה דחיפה ו-Publish...</span>
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    <span>כפה דחיפה ו-Publish עכשיו</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {ghResult && (
            <div
              className={`mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3 text-xs font-bold ${
                ghResult.ok
                  ? 'border-emerald-400/35 bg-emerald-500/10 text-emerald-200'
                  : 'border-rose-500/35 bg-rose-500/10 text-rose-200'
              }`}
            >
              <span>{ghResult.message}</span>
              {ghResult.repoUrl && (
                <a
                  href={ghResult.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 underline hover:text-white"
                >
                  <span>צפה במאגר המעודכן ב-GitHub</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Active Isolated Sandboxes List & Credentials */}
      <section className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-white/15 bg-slate-900/85 p-6 shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div className="flex items-center gap-2.5">
              <Server className="h-5 w-5 text-cyan-300" />
              <h2 className="text-lg font-extrabold text-white">
                סביבות Secured SandBox פעילות ({sandboxes.length})
              </h2>
            </div>
            <span className="font-mono text-xs text-slate-400" dir="ltr">
              NETWORK: 10.244.0.0/16 ISOLATED NAMESPACE
            </span>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {sandboxes.map((sbx) => {
              const isSelected = activeSandbox?.id === sbx.id
              return (
                <div
                  key={sbx.id}
                  onClick={() => setSelectedSandboxId(sbx.id)}
                  className={`cursor-pointer rounded-2xl border p-5 transition-all ${
                    isSelected
                      ? 'border-cyan-400/50 bg-slate-950/90 ring-1 ring-cyan-400/25'
                      : 'border-white/10 bg-slate-950/50 hover:border-white/25'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-400" />
                        <h3 className="font-bold text-white">{sbx.name}</h3>
                        <span className="rounded border border-white/10 bg-slate-900 px-2 py-0.5 font-mono text-[10px] text-cyan-300">
                          {sbx.id}
                        </span>
                      </div>
                      <div
                        dir="ltr"
                        className="mt-1.5 font-mono text-sm font-extrabold text-cyan-300"
                      >
                        {sbx.genericDomain}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCopy(sbx.id, sbx.genericDomain)
                        }}
                        className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-slate-300 hover:bg-white/10 hover:text-white"
                      >
                        {copiedField === sbx.id ? (
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                      {sandboxes.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteSandbox(sbx.id)
                          }}
                          aria-label="השמד סביבה"
                          className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-rose-500/20 bg-rose-500/10 p-1.5 text-rose-300 hover:bg-rose-500/20"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl border border-white/5 bg-slate-900/70 p-3 font-mono text-[11px]" dir="ltr">
                    <div>
                      <span className="text-slate-500">MYSQL DSN: </span>
                      <span className="text-slate-200">
                        {sbx.mysqlUser}@{sbx.privateIp}/{sbx.mysqlDatabase}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">SANDBOX KEY: </span>
                      <span className="text-emerald-300">{sbx.accessToken.slice(0, 16)}…</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Codebase Blueprints inside the Isolated Sandbox (MySQL 8.0, PHP 8.3, Python 3.12, React) */}
      <section className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="font-mono text-xs font-bold tracking-wider text-cyan-300 uppercase">
              SANDBOX CODE WORKSPACE (PHP 8.3 · MYSQL 8.0 · PYTHON 3.12)
            </p>
            <h2 className="mt-1 text-2xl font-extrabold text-white sm:text-3xl">
              קבצי הליבה של סביבת ה-Secured SandBox
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {codeArtifacts.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`cursor-pointer rounded-xl px-4 py-2.5 text-xs font-bold transition-all sm:text-sm ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-l from-cyan-400 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                    : 'border border-white/10 bg-slate-900 text-slate-300 hover:border-white/25 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/15 bg-slate-950 shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 bg-slate-900/90 px-6 py-4">
            <div className="flex items-center gap-3">
              <Code2 className="h-5 w-5 text-cyan-300" />
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-sm font-bold text-white" dir="ltr">
                    {currentArtifact.filename}
                  </span>
                  <span
                    dir="ltr"
                    className="rounded border border-cyan-400/30 bg-cyan-500/10 px-2 py-0.5 font-mono text-[11px] font-semibold text-cyan-300"
                  >
                    {currentArtifact.techBadge}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-400">{currentArtifact.description}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleCopy(currentArtifact.id, currentArtifact.code)}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-white/10"
            >
              {copiedField === currentArtifact.id ? (
                <>
                  <Check className="h-4 w-4 text-emerald-400" />
                  <span className="text-emerald-300">הקוד הועתק</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 text-cyan-300" />
                  <span>העתק קוד</span>
                </>
              )}
            </button>
          </div>

          <pre
            dir="ltr"
            className="max-h-[34rem] overflow-auto p-6 text-left font-mono text-xs leading-6 text-slate-200"
          >
            <code>{currentArtifact.code}</code>
          </pre>
        </div>
      </section>
    </div>
  )
}

export default InternalSystemsPage
