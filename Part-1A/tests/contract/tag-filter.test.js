const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const { spawnSync } = require("node:child_process");
const { createIsolatedDataPath, writeValidStore, createTask } = require("../helpers/isolate-data");

function runCli(args, dataFile) {
  return spawnSync(process.execPath, ["src/cli.js", ...args, "--data-file", dataFile], { encoding: "utf8" });
}

test("tag filter is exact and case-insensitive while excluding substrings", () => {
  const isolated = createIsolatedDataPath("tag-filter");
  const home = createTask("Home", { id: "1", tags: ["Home"] });
  const homework = createTask("Homework", { id: "2", sequence: 2, tags: ["Homework"] });
  writeValidStore(isolated.dataFile, [home, homework], 3);
  try {
    const exact = runCli(["task", "filter-tag", "--tag", "hOmE"], isolated.dataFile);
    assert.equal(exact.status, 0);
    const exactOutput = JSON.parse(exact.stdout);
    assert.equal(exactOutput.ok, true);
    assert.deepEqual(exactOutput.tasks.map((task) => task.id), ["1"]);

    const none = runCli(["task", "filter-tag", "--tag", "work"], isolated.dataFile);
    assert.equal(none.status, 0);
    assert.deepEqual(JSON.parse(none.stdout).tasks, []);
  } finally {
    isolated.cleanup();
  }
});

test("task creation accepts repeated --tag flags without changing exact matching", () => {
  const isolated = createIsolatedDataPath("tag-create");
  writeValidStore(isolated.dataFile, [], 1);
  try {
    const created = runCli(
      ["task", "create", "--title", "Tagged", "--tag", "Home", "--tag", "Work"],
      isolated.dataFile,
    );
    assert.equal(created.status, 0);
    const task = JSON.parse(created.stdout).task;
    assert.deepEqual(task.tags, ["Home", "Work"]);

    const filtered = runCli(["task", "filter-tag", "--tag", "work"], isolated.dataFile);
    assert.equal(filtered.status, 0);
    assert.deepEqual(JSON.parse(filtered.stdout).tasks.map((item) => item.id), [task.id]);
  } finally {
    isolated.cleanup();
  }
});

test("empty, whitespace-only and non-string tag filters are INVALID_INPUT", () => {
  const isolated = createIsolatedDataPath("tag-invalid");
  writeValidStore(isolated.dataFile, [createTask("Existing", { tags: ["Home"] })], 2);
  const before = fs.readFileSync(isolated.dataFile, "utf8");
  try {
    for (const args of [
      ["task", "filter-tag", "--tag", ""],
      ["task", "filter-tag", "--tag", "   "],
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
