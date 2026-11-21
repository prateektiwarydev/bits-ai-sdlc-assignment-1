const test = require("node:test");
const assert = require("node:assert/strict");

test("TODO can advance to IN_PROGRESS and IN_PROGRESS to DONE", async () => {
  const { transitionTaskStatus } = await import("../../src/domain/task-service.js");
  const inProgress = transitionTaskStatus({ status: "TODO" }, "IN_PROGRESS");
  assert.equal(inProgress.status, "IN_PROGRESS");
  const done = transitionTaskStatus(inProgress, "DONE");
  assert.equal(done.status, "DONE");
});

test("illegal TODO to DONE skip leaves the task unchanged", async () => {
  const { transitionTaskStatus } = await import("../../src/domain/task-service.js");
  const task = { id: "1", status: "TODO" };
  const original = structuredClone(task);
  assert.throws(() => transitionTaskStatus(task, "DONE"), { code: "INVALID_TRANSITION" });
  assert.deepEqual(task, original);
});

test("backward and DONE outgoing transitions are rejected", async () => {
  const { transitionTaskStatus } = await import("../../src/domain/task-service.js");
  for (const [status, next] of [
    ["IN_PROGRESS", "TODO"],
    ["DONE", "IN_PROGRESS"],
  ]) {
    assert.throws(() => transitionTaskStatus({ status }, next), {
      code: "INVALID_TRANSITION",
    });
  }
});
