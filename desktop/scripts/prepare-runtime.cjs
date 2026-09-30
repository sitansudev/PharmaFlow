const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const desktopDirectory = path.resolve(__dirname, "..");
const projectDirectory = path.resolve(desktopDirectory, "..");
const runtimeDirectory = path.join(desktopDirectory, "runtime");
const postgresDirectory = path.join(desktopDirectory, "vendor", "pgsql");
const pnpm = process.platform === "win32" ? "pnpm.cmd" : "pnpm";

function run(args) {
  const result = spawnSync(pnpm, args, { cwd: projectDirectory, stdio: "inherit", shell: process.platform === "win32" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

function copy(source, destination) {
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.cpSync(source, destination, { recursive: true });
}

if (!fs.existsSync(path.join(postgresDirectory, "bin", "initdb.exe"))) {
  throw new Error("PostgreSQL runtime not found. Add it to desktop/vendor/pgsql before creating a Windows release.");
}

fs.rmSync(runtimeDirectory, { recursive: true, force: true });
run(["--filter", "backend", "exec", "prisma", "generate"]);
run(["--filter", "backend", "build"]);
run(["--filter", "backend", "deploy", "--prod", path.join(runtimeDirectory, "backend")]);
run(["--filter", "web", "build"]);
copy(path.join(projectDirectory, "apps", "web", ".next-new", "standalone"), path.join(runtimeDirectory, "frontend"));
copy(path.join(projectDirectory, "apps", "web", ".next-new", "static"), path.join(runtimeDirectory, "frontend", "apps", "web", ".next-new", "static"));
copy(path.join(projectDirectory, "apps", "web", "public"), path.join(runtimeDirectory, "frontend", "apps", "web", "public"));
copy(path.join(projectDirectory, "apps", "backend", "prisma", "migrations"), path.join(runtimeDirectory, "migrations"));
copy(postgresDirectory, path.join(runtimeDirectory, "pgsql"));
console.log("PharmaFlow runtime is ready for electron-builder.");
