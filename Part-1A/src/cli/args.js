const fs = require("node:fs");
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
  return path.join(process.cwd(), "data", "tasks.json");
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
};
