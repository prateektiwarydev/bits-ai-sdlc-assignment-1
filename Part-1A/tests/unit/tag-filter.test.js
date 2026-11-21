const test = require("node:test");
const assert = require("node:assert/strict");

test("tag matching is exact and case-insensitive", async () => {
  const { filterTasksByTag } = await import("../../src/domain/task-service.js");
  const tasks = [
    { id: "1", tags: ["Home"] },
    { id: "2", tags: ["Homework"] },
  ];
  assert.deepEqual(filterTasksByTag(tasks, "home").map((task) => task.id), ["1"]);
  assert.deepEqual(filterTasksByTag(tasks, "unknown"), []);
});

test("empty, whitespace-only and non-string filters return INVALID_INPUT", async () => {
  const { filterTasksByTag } = await import("../../src/domain/task-service.js");
  for (const value of ["", "   ", null, 7]) {
    assert.throws(() => filterTasksByTag([], value), { code: "INVALID_INPUT" });
  }
});
