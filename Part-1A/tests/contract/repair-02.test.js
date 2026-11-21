const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { createIsolatedDataPath, writeValidStore, createTask } = require("../helpers/isolate-data");

const projectRoot = path.resolve(__dirname, "../..");
const cliFile = path.join(projectRoot, "src/cli.js");

function runCli(args, dataFile, cwd = projectRoot) {
  const command = dataFile === undefined
    ? [cliFile, ...args]
    : [cliFile, ...args, "--data-file", dataFile];
  return spawnSync(process.execPath, command, { encoding: "utf8", cwd });
}

test("permitted updates preserve status in TODO, IN_PROGRESS and DONE", () => {
  for (const status of ["TODO", "IN_PROGRESS", "DONE"]) {
    const isolated = createIsolatedDataPath(`update-${status}`);
    writeValidStore(isolated.dataFile, [createTask("Original", { status })], 2);
    const before = fs.readFileSync(isolated.dataFile, "utf8");
    try {
      const result = runCli(["task", "update", "--id", "1", "--title", "Updated"], isolated.dataFile);
      assert.equal(result.status, 0);
      const output = JSON.parse(result.stdout);
      assert.equal(output.task.id, "1");
      assert.equal(output.task.title, "Updated");
      assert.equal(output.task.status, status);
      const persisted = JSON.parse(fs.readFileSync(isolated.dataFile, "utf8"));
      assert.equal(persisted.tasks[0].status, status);
      assert.notEqual(fs.readFileSync(isolated.dataFile, "utf8"), before);
    } finally {
      isolated.cleanup();
    }
  }
});

test("update without editable fields returns INVALID_INPUT", () => {
  const isolated = createIsolatedDataPath("update-no-fields");
  writeValidStore(isolated.dataFile, [createTask("Original")], 2);
  const before = fs.readFileSync(isolated.dataFile, "utf8");
  try {
    const result = runCli(["task", "update", "--id", "1"], isolated.dataFile);
    assert.equal(result.status, 2);
    assert.equal(JSON.parse(result.stdout).error.code, "INVALID_INPUT");
    assert.equal(fs.readFileSync(isolated.dataFile, "utf8"), before);
  } finally {
    isolated.cleanup();
  }
});

test("unsupported create status and random list option return INVALID_INPUT", () => {
  const isolated = createIsolatedDataPath("unsupported-options");
  writeValidStore(isolated.dataFile, [], 1);
  const before = fs.readFileSync(isolated.dataFile, "utf8");
  try {
    const status = runCli(["task", "create", "--title", "A", "--status", "DONE"], isolated.dataFile);
    assert.equal(status.status, 2);
    assert.equal(JSON.parse(status.stdout).error.code, "INVALID_INPUT");

    const random = runCli(["task", "list", "--random", "value"], isolated.dataFile);
    assert.equal(random.status, 2);
    assert.equal(JSON.parse(random.stdout).error.code, "INVALID_INPUT");
    assert.equal(fs.readFileSync(isolated.dataFile, "utf8"), before);
  } finally {
    isolated.cleanup();
  }
});

test("empty data-file values return INVALID_INPUT and do not mutate", () => {
  const isolated = createIsolatedDataPath("empty-data-file");
  try {
    const result = runCli(["task", "list", "--data-file", "   "], undefined);
    assert.equal(result.status, 2);
    assert.equal(JSON.parse(result.stdout).error.code, "INVALID_INPUT");
  } finally {
    isolated.cleanup();
  }
});

test("filesystem setup failures return PROCESS_ERROR, not INVALID_INPUT", () => {
  const result = runCli(
    ["task", "create", "--title", "X"],
    "/dev/null/fail.json",
  );
  assert.equal(result.status, 1);
  assert.equal(JSON.parse(result.stdout).error.code, "PROCESS_ERROR");
});

test("default data file resolves under Part-1A from another working directory", () => {
  const otherCwd = fs.mkdtempSync(path.join(os.tmpdir(), "part1a-cwd-"));
  try {
    const argsModule = path.join(projectRoot, "src/cli/args.js");
    const probe = 'const args=require(process.env.ARGS_MODULE); process.stdout.write(args.resolveDataFile({}));';
    const result = spawnSync(process.execPath, ["-e", probe], {
      cwd: otherCwd,
      encoding: "utf8",
      env: { ...process.env, ARGS_MODULE: argsModule },
    });
    assert.equal(result.status, 0);
    assert.equal(result.stdout, path.join(projectRoot, "data/tasks.json"));
  } finally {
    fs.rmSync(otherCwd, { recursive: true, force: true });
  }
});

test("duplicate persisted sequences return INVALID_JSON without overwrite", () => {
  const isolated = createIsolatedDataPath("duplicate-sequences");
  fs.writeFileSync(isolated.dataFile, JSON.stringify({
    version: 1,
    nextId: 3,
    tasks: [
      { id: "1", sequence: 1, title: "One", description: "", tags: [], priority: "MEDIUM", status: "TODO" },
      { id: "2", sequence: 1, title: "Two", description: "", tags: [], priority: "LOW", status: "TODO" },
    ],
  }), "utf8");
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
