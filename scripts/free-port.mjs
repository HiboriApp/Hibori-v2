import { execSync } from "node:child_process";

const port = process.argv[2] || "1420";

function run(command) {
  return execSync(command, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function freePortWindows(targetPort) {
  let output = "";
  try {
    output = run(`netstat -ano | findstr :${targetPort}`);
  } catch {
    return;
  }

  const pids = new Set();
  for (const line of output.split(/\r?\n/)) {
    if (!line.includes("LISTENING")) continue;
    const parts = line.trim().split(/\s+/);
    const pid = parts[parts.length - 1];
    if (!pid || pid === "0") continue;
    pids.add(pid);
  }

  for (const pid of pids) {
    try {
      run(`taskkill /PID ${pid} /F`);
      console.log(`Freed port ${targetPort} by terminating PID ${pid}`);
    } catch {
      // Ignore failures for protected or already-closed processes.
    }
  }
}

function freePortUnix(targetPort) {
  let output = "";
  try {
    output = run(`lsof -ti tcp:${targetPort}`);
  } catch {
    return;
  }

  const pids = output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  for (const pid of pids) {
    try {
      run(`kill -9 ${pid}`);
      console.log(`Freed port ${targetPort} by terminating PID ${pid}`);
    } catch {
      // Ignore failures for protected or already-closed processes.
    }
  }
}

if (process.platform === "win32") {
  freePortWindows(port);
} else {
  freePortUnix(port);
}
