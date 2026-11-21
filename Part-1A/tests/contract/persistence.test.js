const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const { spawnSync } = require("node:child_process");
const { createIsolatedDataPath, writeValidStore, createTask } = require("../helpers/isolate-data");

function runCli(args, dataFile) {
  return spawnSync(process.execPath, ["src/cli.js", ...args, "--data-file", dataFile], { encoding: "utf8" });
}

test("missing persistence file starts an empty collection", () => {
  const isolated = createIsolatedDataPath("missing-persistence");
  try {
    const result = runCli(["task", "list"], isolated.dataFile);
    assert.equal(result.status, 0);
    const output = JSON.parse(result.stdout);
    assert.equal(output.ok, true);
    assert.deepEqual(output.tasks, []);
  } finally {
    isolated.cleanup();
  }
});

test("valid task state restores across separate CLI invocations", () => {
  const isolated = createIsolatedDataPath("restore");
  const task = createTask("Persisted", { id: "1", tags: ["Home"], priority: "HIGH" });
  writeValidStore(isolated.dataFile, [task], 2);
  try {
    const get = runCli(["task", "get", "--id", "1"], isolated.dataFile);
    assert.equal(get.status, 0);
    assert.deepEqual(JSON.parse(get.stdout).task, task);

    const filter = runCli(["task", "filter-tag", "--tag", "home"], isolated.dataFile);
    assert.equal(filter.status, 0);
    assert.deepEqual(JSON.parse(filter.stdout).tasks.map((item) => item.id), ["1"]);
  } finally {
    isolated.cleanup();
  }
});

test("malformed JSON returns INVALID_JSON and does not overwrite", () => {
  const isolated = createIsolatedDataPath("malformed");
  fs.writeFileSync(isolated.dataFile, "{not json", "utf8");
  const before = fs.readFileSync(isolated.dataFile, "utf8");
  try {
    const result = runCli(["task", "list"], isolated.dataFile);
    assert.equal(result.status, 5);
    assert.equal(JSON.parse(result.stdout).error.code, "INVALID_JSON");
    assert.equal(fs.readFileSync(isolated.dataFile, "utf8"), before);
  } finally {
    isolated.cleanup();
  }
});

test("structurally invalid JSON returns INVALID_JSON without overwrite", () => {
  const isolated = createIsolatedDataPath("invalid-schema");
  fs.writeFileSync(isolated.dataFile, JSON.stringify({ version: 1, nextId: "bad", tasks: "bad" }), "utf8");
  const before = fs.readFileSync(isolated.dataFile, "utf8");
  try {
    const result = runCli(["task", "get", "--id", "1"], isolated.dataFile);
    assert.equal(result.status, 5);
    assert.equal(JSON.parse(result.stdout).error.code, "INVALID_JSON");
    assert.equal(fs.readFileSync(isolated.dataFile, "utf8"), before);
  } finally {
    isolated.cleanup();
  }
});
