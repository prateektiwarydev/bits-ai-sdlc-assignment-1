const test = require("node:test");
const assert = require("node:assert/strict");

test("priority sorting is HIGH, MEDIUM, LOW with stable ties", async () => {
  const { sortTasksByPriority } = await import("../../src/domain/task-service.js");
  const tasks = [
    { id: "1", priority: "LOW" },
    { id: "2", priority: "HIGH" },
    { id: "3", priority: "MEDIUM" },
    { id: "4", priority: "HIGH" },
  ];
  const original = structuredClone(tasks);
  assert.deepEqual(sortTasksByPriority(tasks).map((task) => task.id), ["2", "4", "3", "1"]);
  assert.deepEqual(tasks, original);
});
