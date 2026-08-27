const { app, BrowserWindow } = require("electron");
const { spawn } = require("child_process");
const http = require("http");
const path = require("path");

const HOST = "127.0.0.1";
const BACKEND_PORT = 5001;
const FRONTEND_PORT = 3417;

const RUNTIME_DIR = app.isPackaged
  ? path.join(process.resourcesPath, "runtime")
  : path.join(__dirname, "runtime");

const BACKEND_DIR = path.join(RUNTIME_DIR, "backend");
const FRONTEND_DIR = path.join(
  RUNTIME_DIR,
  "frontend",
  "apps",
  "web"
);

let backendProcess = null;
let frontendProcess = null;
let mainWindow = null;

function startServer(script, cwd, port) {
  const env = {
    ...process.env,
    ELECTRON_RUN_AS_NODE: "1",
    NODE_ENV: "production",
    PORT: String(port),
    HOSTNAME: HOST,
  };

  return spawn(process.execPath, [script], {
    cwd,
    env,
    windowsHide: true,
  });
}

function monitorProcess(name, child) {
  child.stdout?.on("data", (data) => {
    console.log(`${name}: ${data}`);
  });

  child.stderr?.on("data", (data) => {
    console.error(`${name}: ${data}`);
  });

  child.on("error", (error) => {
    console.error(`${name} failed:`, error);
  });

  child.on("exit", (code, signal) => {
    console.log(`${name} exited: code=${code}, signal=${signal}`);
  });
}

function startBackend() {
  backendProcess = startServer(
    "dist/server.js",
    BACKEND_DIR,
    BACKEND_PORT
  );

  monitorProcess("Backend", backendProcess);
}

function startFrontend() {
  frontendProcess = startServer(
    "server.js",
    FRONTEND_DIR,
    FRONTEND_PORT
  );

  monitorProcess("Frontend", frontendProcess);
}

function waitForHttp(url, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const startedAt = Date.now();

    function check() {
      const request = http.get(url, (response) => {
        response.resume();

        if (response.statusCode >= 200 && response.statusCode < 500) {
          resolve();
          return;
        }

        retry();
      });

      request.on("error", retry);

      function retry() {
        if (Date.now() - startedAt >= timeout) {
          reject(
            new Error(`Server did not become ready: ${url}`)
          );
          return;
        }

        setTimeout(check, 300);
      }
    }

    check();
  });
}

function stopProcess(child) {
  if (!child || child.killed) {
    return;
  }

  try {
    child.kill();
  } catch (error) {
    console.error("Failed to stop process:", error);
  }
}

async function createWindow() {
  startBackend();

  await waitForHttp(
    `http://${HOST}:${BACKEND_PORT}/health`
  );

  console.log("Backend ready.");

  startFrontend();

  await waitForHttp(
    `http://${HOST}:${FRONTEND_PORT}`
  );

  console.log("Frontend ready.");

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1000,
    minHeight: 650,
    title: "PharmaFlow",
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  await mainWindow.loadURL(
    `http://${HOST}:${FRONTEND_PORT}`
  );
}

app.whenReady().then(async () => {
  try {
    await createWindow();
  } catch (error) {
    console.error("Failed to launch PharmaFlow:", error);

    stopProcess(frontendProcess);
    stopProcess(backendProcess);

    app.quit();
  }
});

app.on("before-quit", () => {
  stopProcess(frontendProcess);
  stopProcess(backendProcess);

  frontendProcess = null;
  backendProcess = null;
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});