const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

function getDatabasePath() {
    return process.env.DB_PATH || path.join(__dirname, "../../data/runtime.db");
}

function escapeValue(value) {
    if (value === null || value === undefined) {
        return "NULL";
    }

    return `'${String(value).replaceAll("'", "''")}'`;
}

function runSql(sql) {
    const databasePath = getDatabasePath();
    fs.mkdirSync(path.dirname(databasePath), { recursive: true });

    return execFileSync("sqlite3", [databasePath, sql], {
        encoding: "utf8"
    });
}

function querySql(sql) {
    const databasePath = getDatabasePath();
    fs.mkdirSync(path.dirname(databasePath), { recursive: true });

    const output = execFileSync("sqlite3", ["-json", databasePath, sql], {
        encoding: "utf8"
    });

    return JSON.parse(output || "[]");
}

function initDatabase() {
    runSql(`
        CREATE TABLE IF NOT EXISTS release_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            service TEXT NOT NULL,
            version TEXT NOT NULL,
            environment TEXT NOT NULL,
            requested_by TEXT NOT NULL,
            decision TEXT NOT NULL,
            risk_level TEXT NOT NULL,
            requires_human_review INTEGER NOT NULL,
            decision_payload TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
    `);
}

function saveReleaseDecision(release, result) {
    initDatabase();

    runSql(`
        INSERT INTO release_history (
            service,
            version,
            environment,
            requested_by,
            decision,
            risk_level,
            requires_human_review,
            decision_payload
        ) VALUES (
            ${escapeValue(release.service)},
            ${escapeValue(release.version)},
            ${escapeValue(release.environment)},
            ${escapeValue(release.requestedBy)},
            ${escapeValue(result.decision.decision)},
            ${escapeValue(result.evaluation.riskLevel)},
            ${result.decision.requiresHumanReview ? 1 : 0},
            ${escapeValue(JSON.stringify(result))}
        );
    `);
}

function getReleaseHistory() {
    initDatabase();

    return querySql(`
        SELECT
            id,
            service,
            version,
            environment,
            requested_by AS requestedBy,
            decision,
            risk_level AS riskLevel,
            requires_human_review AS requiresHumanReview,
            created_at AS createdAt
        FROM release_history
        ORDER BY id DESC;
    `).map((release) => ({
        ...release,
        requiresHumanReview: Boolean(release.requiresHumanReview)
    }));
}

module.exports = {
    initDatabase,
    saveReleaseDecision,
    getReleaseHistory
};
