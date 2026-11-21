const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const { spawnSync } = require("node:child_process");
const { createIsolatedDataPath, writeValidStore, createTask } = require("../helpers/isolate-data");

function runCli(args, dataFile) {
  return spawnSync(process.execPath, ["src/cli.js", ...args, "--data-file", dataFile], { encoding: "utf8" });
}

test("priority list is HIGH, MEDIUM, LOW with stable equal-priority ties", () => {
  const isolated = createIsolatedDataPath("priority");
  const tasks = [
    createTask("Low", { id: "1", priority: "LOW", sequence: 1 }),
    createTask("High A", { id: "2", priority: "HIGH", sequence: 2 }),
    createTask("Medium", { id: "3", priority: "MEDIUM", sequence: 3 }),
    createTask("High B", { id: "4", priority: "HIGH", sequence: 4 }),
  ];
  writeValidStore(isolated.dataFile, tasks, 5);
  const before = fs.readFileSync(isolated.dataFile, "utf8");
  try {
    const result = runCli(["task", "list", "--sort", "priority"], isolated.dataFile);
    assert.equal(result.status, 0);
    const output = JSON.parse(result.stdout);
    assert.deepEqual(output.tasks.map((task) => task.id), ["2", "4", "3", "1"]);
    assert.equal(fs.readFileSync(isolated.dataFile, "utf8"), before);
  } finally {
    isolated.cleanup();
  }
});

test("invalid priority update returns INVALID_INPUT without mutation", () => {
  const isolated = createIsolatedDataPath("priority-invalid");
  writeValidStore(isolated.dataFile, [createTask("Existing")], 2);
  const before = fs.readFileSync(isolated.dataFile, "utf8");
  try {
    const result = runCli(["task", "update", "--id", "1", "--priority", "urgent"], isolated.dataFile);
    assert.equal(result.status, 2);
    assert.equal(JSON.parse(result.stdout).error.code, "INVALID_INPUT");
    assert.equal(fs.readFileSync(isolated.dataFile, "utf8"), before);
  } finally {
    isolated.cleanup();
  }
});
