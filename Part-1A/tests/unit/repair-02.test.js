const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const { createIsolatedDataPath } = require("../helpers/isolate-data");

test("domain updates preserve TODO, IN_PROGRESS and DONE status", async () => {
  const { updateTask } = await import("../../src/domain/task-service.js");
  for (const status of ["TODO", "IN_PROGRESS", "DONE"]) {
    const collection = {
      version: 1,
      nextId: 2,
      tasks: [{
        id: "1",
        sequence: 1,
        title: "Original",
        description: "",
        tags: [],
        priority: "MEDIUM",
        status,
      }],
    };
    const updated = updateTask(collection, "1", { title: "Updated" });
    assert.equal(updated.tasks[0].id, "1");
    assert.equal(updated.tasks[0].title, "Updated");
    assert.equal(updated.tasks[0].status, status);
  }
});

test("persisted duplicate task sequences are INVALID_JSON", async () => {
  const store = await import("../../src/persistence/json-store.js");
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
    assert.throws(() => store.loadStore(isolated.dataFile), { code: "INVALID_JSON" });
    assert.equal(fs.readFileSync(isolated.dataFile, "utf8"), before);
  } finally {
    isolated.cleanup();
  }
});
