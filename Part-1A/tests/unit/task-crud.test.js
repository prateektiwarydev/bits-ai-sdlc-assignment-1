const test = require("node:test");
const assert = require("node:assert/strict");

test("CRUD exports and create defaults are available", async () => {
  const crud = await import("../../src/domain/task-service.js");
  for (const name of ["createTask", "getTask", "listTasks", "updateTask", "deleteTask"]) {
    assert.equal(typeof crud[name], "function");
  }
  const validation = await import("../../src/domain/validation.js");
  assert.deepEqual(validation.validateTaskInput({ title: "Task" }), {
    title: "Task",
    description: "",
    tags: [],
    priority: "MEDIUM",
    status: "TODO",
  });
});

test("blank, invalid-type, invalid-tag, and invalid-priority inputs are rejected", async () => {
  const { validateTaskInput } = await import("../../src/domain/validation.js");
  for (const input of [
    { title: "   " },
    { title: 12 },
    { title: "Valid", description: 12 },
    { title: "Valid", tags: "home" },
    { title: "Valid", tags: [""] },
    { title: "Valid", priority: "urgent" },
  ]) {
    assert.throws(() => validateTaskInput(input), { code: "INVALID_INPUT" });
  }
});

test("CRUD operations preserve the collection and immutable ID", async () => {
  const crud = await import("../../src/domain/task-service.js");
  let collection = { version: 1, nextId: 1, tasks: [] };
  collection = crud.createTask(collection, { title: "First" });
  assert.equal(collection.tasks[0].id, "1");
  assert.equal(collection.nextId, 2);
  assert.equal(collection.tasks[0].description, "");
  assert.deepEqual(collection.tasks[0].tags, []);
  assert.equal(collection.tasks[0].priority, "MEDIUM");
  assert.equal(collection.tasks[0].status, "TODO");

  const original = structuredClone(collection);
  assert.throws(
    () => crud.updateTask(collection, "1", { id: "2", title: "Changed" }),
    { code: "INVALID_INPUT" },
  );
  assert.deepEqual(collection, original);

  collection = crud.updateTask(collection, "1", { title: "Updated" });
  assert.equal(crud.getTask(collection, "1").title, "Updated");
  assert.equal(crud.getTask(collection, "1").id, "1");
  assert.equal(crud.listTasks(collection).length, 1);
  collection = crud.deleteTask(collection, "1");
  assert.throws(() => crud.getTask(collection, "1"), { code: "TASK_NOT_FOUND" });
});

test("unknown IDs produce TASK_NOT_FOUND without mutation", async () => {
  const crud = await import("../../src/domain/task-service.js");
  const collection = { version: 1, nextId: 1, tasks: [] };
  const original = structuredClone(collection);
  for (const operation of [
    () => crud.getTask(collection, "999"),
    () => crud.updateTask(collection, "999", { title: "Changed" }),
    () => crud.deleteTask(collection, "999"),
  ]) {
    assert.throws(operation, { code: "TASK_NOT_FOUND" });
  }
  assert.deepEqual(collection, original);
});
