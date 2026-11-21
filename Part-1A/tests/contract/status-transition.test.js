const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const { spawnSync } = require("node:child_process");
const { createIsolatedDataPath, writeValidStore, createTask } = require("../helpers/isolate-data");

function runCli(args, dataFile) {
  return spawnSync(process.execPath, ["src/cli.js", ...args, "--data-file", dataFile], { encoding: "utf8" });
}

test("TODO to IN_PROGRESS to DONE is the legal transition sequence", () => {
  const isolated = createIsolatedDataPath("transition-success");
  writeValidStore(isolated.dataFile, [createTask("Task")], 2);
  try {
    const first = runCli(["task", "transition", "--id", "1", "--to", "IN_PROGRESS"], isolated.dataFile);
    assert.equal(first.status, 0);
    assert.equal(JSON.parse(first.stdout).task.status, "IN_PROGRESS");

    const second = runCli(["task", "transition", "--id", "1", "--to", "DONE"], isolated.dataFile);
    assert.equal(second.status, 0);
    assert.equal(JSON.parse(second.stdout).task.status, "DONE");
  } finally {
    isolated.cleanup();
  }
});

test("TODO to DONE skip is rejected and task remains TODO", () => {
  const isolated = createIsolatedDataPath("transition-skip");
  writeValidStore(isolated.dataFile, [createTask("Task")], 2);
  const before = fs.readFileSync(isolated.dataFile, "utf8");
  try {
    const result = runCli(["task", "transition", "--id", "1", "--to", "DONE"], isolated.dataFile);
    assert.equal(result.status, 4);
    assert.equal(JSON.parse(result.stdout).error.code, "INVALID_TRANSITION");
    const persisted = JSON.parse(fs.readFileSync(isolated.dataFile, "utf8"));
    assert.equal(persisted.tasks[0].status, "TODO");
    assert.equal(fs.readFileSync(isolated.dataFile, "utf8"), before);
  } finally {
    isolated.cleanup();
  }
});

test("unknown transition ID and direct status update are non-mutating", () => {
  const isolated = createIsolatedDataPath("transition-errors");
  writeValidStore(isolated.dataFile, [createTask("Task")], 2);
  const before = fs.readFileSync(isolated.dataFile, "utf8");
  try {
    const missing = runCli(["task", "transition", "--id", "999", "--to", "IN_PROGRESS"], isolated.dataFile);
    assert.equal(missing.status, 3);
    assert.equal(JSON.parse(missing.stdout).error.code, "TASK_NOT_FOUND");

    const direct = runCli(["task", "update", "--id", "1", "--status", "DONE"], isolated.dataFile);
    assert.equal(direct.status, 2);
    assert.equal(JSON.parse(direct.stdout).error.code, "INVALID_INPUT");
    assert.equal(fs.readFileSync(isolated.dataFile, "utf8"), before);
  } finally {
    isolated.cleanup();
  }
});
