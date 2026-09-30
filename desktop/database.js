const { randomBytes } = require("crypto");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const HOST = "127.0.0.1";
const PORT = 54329;
const DATABASE_NAME = "pharmaflow";
const DATABASE_USER = "pharmaflow";

function executable(binDirectory, name) {
  return path.join(binDirectory, `${name}${process.platform === "win32" ? ".exe" : ""}`);
}

function run(binDirectory, name, args, env) {
  const result = spawnSync(executable(binDirectory, name), args, { encoding: "utf8", env, windowsHide: true });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${name} failed: ${(result.stderr || result.stdout || "Unknown error").trim()}`);
  return result.stdout;
}

function status(binDirectory, name, args, env) {
  return spawnSync(executable(binDirectory, name), args, { encoding: "utf8", env, windowsHide: true }).status ?? 1;
}

function quote(value) {
  return `'${value.replaceAll("'", "''")}'`;
}

function readConfig(userDataDirectory) {
  const directory = path.join(userDataDirectory, "config");
  const configPath = path.join(directory, "database.json");
  fs.mkdirSync(directory, { recursive: true });
  if (fs.existsSync(configPath)) return JSON.parse(fs.readFileSync(configPath, "utf8"));

  const config = { password: randomBytes(32).toString("hex"), jwtSecret: randomBytes(48).toString("hex") };
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), { mode: 0o600 });
  return config;
}

function psqlArgs() {
  return ["-h", HOST, "-p", String(PORT), "-U", DATABASE_USER, "-d", DATABASE_NAME, "-v", "ON_ERROR_STOP=1"];
}

function initializeCluster(binDirectory, dataDirectory, config, env) {
  if (fs.existsSync(path.join(dataDirectory, "PG_VERSION"))) return;
  fs.mkdirSync(dataDirectory, { recursive: true });
  const passwordFile = path.join(path.dirname(dataDirectory), ".postgres-password");
  fs.writeFileSync(passwordFile, `${config.password}\n`, { mode: 0o600 });
  try {
    run(binDirectory, "initdb", ["-D", dataDirectory, "-U", DATABASE_USER, "-A", "scram-sha-256", "--pwfile", passwordFile, "--encoding", "UTF8"], env);
  } finally {
    fs.rmSync(passwordFile, { force: true });
  }
}

function startCluster(binDirectory, dataDirectory, userDataDirectory, env) {
  if (status(binDirectory, "pg_ctl", ["-D", dataDirectory, "status"], env) === 0) return false;
  const logs = path.join(userDataDirectory, "logs");
  fs.mkdirSync(logs, { recursive: true });
  run(binDirectory, "pg_ctl", ["-D", dataDirectory, "-l", path.join(logs, "postgresql.log"), "-o", `-p ${PORT} -h ${HOST}`, "-w", "-t", "60", "start"], env);
  return true;
}

function ensureDatabase(binDirectory, env) {
  const exists = run(binDirectory, "psql", ["-h", HOST, "-p", String(PORT), "-U", DATABASE_USER, "-d", "postgres", "-tAc", `SELECT 1 FROM pg_database WHERE datname = ${quote(DATABASE_NAME)}`], env).trim();
  if (exists !== "1") run(binDirectory, "createdb", ["-h", HOST, "-p", String(PORT), "-U", DATABASE_USER, "-E", "UTF8", DATABASE_NAME], env);
}

function applyMigrations(binDirectory, migrationsDirectory, env) {
  if (!fs.existsSync(migrationsDirectory)) throw new Error("The bundled database migrations are missing. Reinstall PharmaFlow using the complete installer.");
  const args = psqlArgs();
  run(binDirectory, "psql", [...args, "-c", "CREATE TABLE IF NOT EXISTS pharmaflow_desktop_migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW())"], env);
  const names = fs.readdirSync(migrationsDirectory, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
  for (const name of names) {
    const migration = path.join(migrationsDirectory, name, "migration.sql");
    if (!fs.existsSync(migration)) continue;
    const applied = run(binDirectory, "psql", [...args, "-tAc", `SELECT 1 FROM pharmaflow_desktop_migrations WHERE name = ${quote(name)}`], env).trim();
    if (applied === "1") continue;
    run(binDirectory, "psql", [...args, "-f", migration], env);
    run(binDirectory, "psql", [...args, "-c", `INSERT INTO pharmaflow_desktop_migrations (name) VALUES (${quote(name)})`], env);
  }
}

function prepareDatabase({ userDataDirectory, runtimeDirectory }) {
  const config = readConfig(userDataDirectory);
  const dataDirectory = path.join(userDataDirectory, "database");
  const binDirectory = path.join(runtimeDirectory, "pgsql", "bin");
  if (!fs.existsSync(executable(binDirectory, "initdb"))) throw new Error("The bundled PostgreSQL runtime is missing. Reinstall PharmaFlow using the complete installer.");
  const env = { ...process.env, PGPASSWORD: config.password };
  initializeCluster(binDirectory, dataDirectory, config, env);
  const startedByApp = startCluster(binDirectory, dataDirectory, userDataDirectory, env);
  ensureDatabase(binDirectory, env);
  applyMigrations(binDirectory, path.join(runtimeDirectory, "migrations"), env);
  return { dataDirectory, binDirectory, env, startedByApp, jwtSecret: config.jwtSecret, databaseUrl: `postgresql://${DATABASE_USER}:${encodeURIComponent(config.password)}@${HOST}:${PORT}/${DATABASE_NAME}` };
}

function stopDatabase(database) {
  if (database?.startedByApp) status(database.binDirectory, "pg_ctl", ["-D", database.dataDirectory, "-m", "fast", "-w", "stop"], database.env);
}

module.exports = { prepareDatabase, stopDatabase };
