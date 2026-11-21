const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const { createIsolatedDataPath } = require("../helpers/isolate-data");

test("missing persistence data initializes an empty task collection", async () => {
  const store = await import("../../src/persistence/json-store.js");
  const isolated = createIsolatedDataPath("missing");
  try {
    assert.deepEqual(store.loadStore(isolated.dataFile), { version: 1, nextId: 1, tasks: [] });
  } finally {
    isolated.cleanup();
  }
});

test("malformed JSON returns INVALID_JSON without overwriting the file", async () => {
  const store = await import("../../src/persistence/json-store.js");
  const isolated = createIsolatedDataPath("malformed");
  fs.writeFileSync(isolated.dataFile, "{not json", "utf8");
  try {
    assert.throws(() => store.loadStore(isolated.dataFile), { code: "INVALID_JSON" });
    assert.equal(fs.readFileSync(isolated.dataFile, "utf8"), "{not json");
  } finally {
    isolated.cleanup();
  }
});

test("valid JSON round trips all task fields", async () => {
  const store = await import("../../src/persistence/json-store.js");
  const isolated = createIsolatedDataPath("roundtrip");
  const document = {
    version: 1,
    nextId: 2,
    tasks: [{ id: "1", sequence: 1, title: "Task", description: "", tags: [], priority: "MEDIUM", status: "TODO" }],
  };
  try {
    store.saveStore(isolated.dataFile, document);
    assert.deepEqual(store.loadStore(isolated.dataFile), document);
  } finally {
    isolated.cleanup();
  }
});

test("structurally invalid JSON returns INVALID_JSON without overwrite", async () => {
  const store = await import("../../src/persistence/json-store.js");
  const isolated = createIsolatedDataPath("invalid-schema");
  fs.writeFileSync(
    isolated.dataFile,
    JSON.stringify({ version: 1, nextId: "bad", tasks: "bad" }),
    "utf8",
  );
  const before = fs.readFileSync(isolated.dataFile, "utf8");
  try {
    assert.throws(() => store.loadStore(isolated.dataFile), { code: "INVALID_JSON" });
    assert.equal(fs.readFileSync(isolated.dataFile, "utf8"), before);
  } finally {
    isolated.cleanup();
  }
});
