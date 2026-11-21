const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const { spawnSync } = require("node:child_process");
const { createIsolatedDataPath, writeValidStore, createTask } = require("../helpers/isolate-data");

function runCli(args, dataFile) {
  return spawnSync(process.execPath, ["src/cli.js", ...args, "--data-file", dataFile], {
    encoding: "utf8",
  });
}

test("CRUD lifecycle persists exact task fields and immutable ID", () => {
  const isolated = createIsolatedDataPath("crud");
  writeValidStore(isolated.dataFile, [], 1);
  try {
    const created = runCli(["task", "create", "--title", "First"], isolated.dataFile);
    assert.equal(created.status, 0);
    const createdOutput = JSON.parse(created.stdout);
    assert.equal(createdOutput.ok, true);
    assert.equal(createdOutput.operation, "task.create");
    assert.equal(createdOutput.task.id, "1");
    assert.equal(createdOutput.task.title, "First");
    assert.equal(createdOutput.task.description, "");
    assert.deepEqual(createdOutput.task.tags, []);
    assert.equal(createdOutput.task.priority, "MEDIUM");
    assert.equal(createdOutput.task.status, "TODO");

    const persisted = JSON.parse(fs.readFileSync(isolated.dataFile, "utf8"));
    assert.equal(persisted.nextId, 2);
    assert.deepEqual(persisted.tasks, [createdOutput.task]);

    const got = runCli(["task", "get", "--id", "1"], isolated.dataFile);
    assert.equal(got.status, 0);
    assert.equal(JSON.parse(got.stdout).task.id, "1");

    const updated = runCli(["task", "update", "--id", "1", "--title", "Updated"], isolated.dataFile);
    assert.equal(updated.status, 0);
    assert.equal(JSON.parse(updated.stdout).task.id, "1");
    assert.equal(JSON.parse(updated.stdout).task.title, "Updated");

    const listed = runCli(["task", "list"], isolated.dataFile);
    assert.equal(listed.status, 0);
    assert.equal(JSON.parse(listed.stdout).tasks.length, 1);

    const deleted = runCli(["task", "delete", "--id", "1"], isolated.dataFile);
    assert.equal(deleted.status, 0);
    assert.deepEqual(JSON.parse(deleted.stdout).tasks ?? [], []);
    assert.deepEqual(JSON.parse(fs.readFileSync(isolated.dataFile, "utf8")).tasks, []);
  } finally {
    isolated.cleanup();
  }
});

test("blank title and invalid types return INVALID_INPUT without mutation", () => {
  const isolated = createIsolatedDataPath("crud-invalid");
  writeValidStore(isolated.dataFile, [createTask("Existing")], 2);
  const before = fs.readFileSync(isolated.dataFile, "utf8");
  try {
    for (const args of [
      ["task", "create", "--title", "   "],
      ["task", "create", "--title", "Valid", "--priority", "urgent"],
    ]) {
      const result = runCli(args, isolated.dataFile);
      assert.equal(result.status, 2);
      assert.equal(JSON.parse(result.stdout).error.code, "INVALID_INPUT");
      assert.equal(fs.readFileSync(isolated.dataFile, "utf8"), before);
    }
  } finally {
    isolated.cleanup();
  }
});

test("missing required IDs use INVALID_INPUT and unknown selectors use TASK_NOT_FOUND", () => {
  const isolated = createIsolatedDataPath("crud-missing");
  writeValidStore(isolated.dataFile, [createTask("Existing")], 2);
  const before = fs.readFileSync(isolated.dataFile, "utf8");
  try {
    for (const args of [
      ["task", "get"],
      ["task", "update"],
      ["task", "delete"],
    ]) {
      const result = runCli(args, isolated.dataFile);
      assert.equal(result.status, 2);
      assert.equal(JSON.parse(result.stdout).error.code, "INVALID_INPUT");
      assert.equal(fs.readFileSync(isolated.dataFile, "utf8"), before);
    }
    for (const args of [
      ["task", "get", "--id", "999"],
      ["task", "update", "--id", "999", "--title", "Changed"],
      ["task", "delete", "--id", "999"],
    ]) {
      const result = runCli(args, isolated.dataFile);
      assert.equal(result.status, 3);
      assert.equal(JSON.parse(result.stdout).error.code, "TASK_NOT_FOUND");
      assert.equal(fs.readFileSync(isolated.dataFile, "utf8"), before);
    }
  } finally {
    isolated.cleanup();
  }
});

test("ID and status cannot be changed through generic update", () => {
  const isolated = createIsolatedDataPath("crud-immutable");
  writeValidStore(isolated.dataFile, [createTask("Existing")], 2);
  const before = fs.readFileSync(isolated.dataFile, "utf8");
  try {
    for (const args of [
      ["task", "update", "--id", "1", "--status", "DONE"],
    ]) {
      const result = runCli(args, isolated.dataFile);
      assert.equal(result.status, 2);
      assert.equal(JSON.parse(result.stdout).error.code, "INVALID_INPUT");
      assert.equal(fs.readFileSync(isolated.dataFile, "utf8"), before);
    }
  } finally {
    isolated.cleanup();
  }
});
