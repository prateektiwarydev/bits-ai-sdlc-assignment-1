const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const VALID_PRIORITIES = new Set(["HIGH", "MEDIUM", "LOW"]);
const VALID_STATUSES = new Set(["TODO", "IN_PROGRESS", "DONE"]);

function error(code) {
  const err = new Error(code);
  err.code = code;
  return err;
}

function isValidTask(task) {
  return (
    task &&
    typeof task === "object" &&
    typeof task.id === "string" &&
    task.id.length > 0 &&
    typeof task.sequence === "number" &&
    Number.isInteger(task.sequence) &&
    task.sequence >= 1 &&
    typeof task.title === "string" &&
    task.title.trim().length > 0 &&
    typeof task.description === "string" &&
    Array.isArray(task.tags) &&
    task.tags.every(
      (tag) => typeof tag === "string" && tag.trim().length > 0,
    ) &&
    typeof task.priority === "string" &&
    VALID_PRIORITIES.has(task.priority) &&
    typeof task.status === "string" &&
    VALID_STATUSES.has(task.status)
  );
}

function isValidStore(document) {
  if (
    !document ||
    typeof document !== "object" ||
    document.version !== 1 ||
    typeof document.nextId !== "number" ||
    !Number.isInteger(document.nextId) ||
    document.nextId < 1 ||
    !Array.isArray(document.tasks)
  ) {
    return false;
  }
  if (!document.tasks.every(isValidTask)) return false;

  const ids = new Set();
  let maxSequence = 0;
  for (const task of document.tasks) {
    if (ids.has(task.id)) return false;
    ids.add(task.id);
    if (task.sequence > maxSequence) maxSequence = task.sequence;
  }
  return maxSequence < document.nextId;
}

function loadStore(dataFile) {
  if (!fs.existsSync(dataFile)) {
    return { version: 1, nextId: 1, tasks: [] };
  }

  let text;
  try {
    text = fs.readFileSync(dataFile, "utf8");
  } catch (_) {
    throw error("INVALID_JSON");
  }
  if (text.trim().length === 0) {
    throw error("INVALID_JSON");
  }

  let document;
  try {
    document = JSON.parse(text);
  } catch (_) {
    throw error("INVALID_JSON");
  }
  if (!isValidStore(document)) {
    throw error("INVALID_JSON");
  }
  return document;
}

function saveStore(dataFile, document) {
  if (!isValidStore(document)) {
    throw error("INVALID_JSON");
  }
  const directory = path.dirname(dataFile);
  fs.mkdirSync(directory, { recursive: true });
  const temporary = path.join(
    directory,
    `.${path.basename(dataFile)}.${process.pid}.${crypto.randomUUID()}.tmp`,
  );
  try {
    fs.writeFileSync(temporary, JSON.stringify(document, null, 2) + "\n", {
      encoding: "utf8",
      flag: "wx",
    });
    fs.renameSync(temporary, dataFile);
  } catch (_) {
    if (fs.existsSync(temporary)) fs.unlinkSync(temporary);
    throw _;
  }
}

module.exports = {
  loadStore,
  saveStore,
};
