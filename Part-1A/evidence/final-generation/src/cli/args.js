const path = require("node:path");

function error(code) {
  const err = new Error(code);
  err.code = code;
  return err;
}

function parseArgs(argv) {
  if (!Array.isArray(argv)) throw error("INVALID_INPUT");
  const values = {};
  const tags = [];
  let dataFile;

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (!argument.startsWith("--")) {
      throw error("INVALID_INPUT");
    }
    const name = argument.slice(2);
    if (name === "tag") {
      if (index + 1 >= argv.length) throw error("INVALID_INPUT");
      tags.push(argv[index + 1]);
      index += 1;
      continue;
    }
    if (index + 1 >= argv.length) throw error("INVALID_INPUT");
    const value = argv[index + 1];
    if (value.startsWith("--")) throw error("INVALID_INPUT");
    if (name === "data-file") {
      dataFile = value;
    } else {
      values[name] = value;
    }
    index += 1;
  }

  if (tags.length > 0) values.tags = tags;
  if (dataFile !== undefined) values.dataFile = dataFile;
  return values;
}

function getDefaultDataFile() {
  const projectRoot = path.resolve(__dirname, "../..");
  return path.join(projectRoot, "data", "tasks.json");
}

const ALLOWED_OPTIONS = {
  create: new Set(["title", "description", "tag", "priority", "data-file"]),
  get: new Set(["id", "data-file"]),
  list: new Set(["sort", "data-file"]),
  update: new Set(["id", "title", "description", "tag", "priority", "data-file"]),
  delete: new Set(["id", "data-file"]),
  "filter-tag": new Set(["tag", "data-file"]),
  transition: new Set(["id", "to", "data-file"]),
};

function validateOperationOptions(operation, args) {
  const allowed = ALLOWED_OPTIONS[operation];
  if (!allowed) throw error("INVALID_INPUT");
  for (const name of Object.keys(args)) {
    if (name !== "tags" && name !== "dataFile" && !allowed.has(name)) {
      throw error("INVALID_INPUT");
    }
  }
  if (
    args.tags !== undefined &&
    operation !== "create" &&
    operation !== "filter-tag"
  ) {
    throw error("INVALID_INPUT");
  }
}

function resolveDataFile(args) {
  if (args.dataFile !== undefined) {
    if (typeof args.dataFile !== "string" || args.dataFile.trim().length === 0) {
      throw error("INVALID_INPUT");
    }
    return path.resolve(args.dataFile);
  }
  return getDefaultDataFile();
}

function requireValue(args, name) {
  if (
    !Object.prototype.hasOwnProperty.call(args, name) ||
    typeof args[name] !== "string" ||
    args[name].trim().length === 0
  ) {
    throw error("INVALID_INPUT");
  }
  return args[name];
}

module.exports = {
  parseArgs,
  resolveDataFile,
  requireValue,
  validateOperationOptions,
};
