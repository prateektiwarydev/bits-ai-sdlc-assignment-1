const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

function createIsolatedDataPath(testName) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "part1a-"));
  return {
    dir,
    dataFile: path.join(dir, `${testName}.json`),
    cleanup() {
      fs.rmSync(dir, { recursive: true, force: true });
    },
  };
}

function writeValidStore(dataFile, tasks = [], nextId = 1) {
  fs.mkdirSync(path.dirname(dataFile), { recursive: true });
  fs.writeFileSync(
    dataFile,
    JSON.stringify({ version: 1, nextId, tasks }, null, 2),
    "utf8",
  );
}

function createTask(title, overrides = {}) {
  return {
    id: overrides.id ?? "1",
    sequence: overrides.sequence ?? 1,
    title,
    description: overrides.description ?? "",
    tags: overrides.tags ?? [],
    priority: overrides.priority || "MEDIUM",
    status: overrides.status || "TODO",
  };
}

module.exports = { createIsolatedDataPath, writeValidStore, createTask };
