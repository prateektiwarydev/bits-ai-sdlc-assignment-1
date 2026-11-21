const fs = require("node:fs");
const path = require("node:path");
const cp = require("node:child_process");

function findJavaScriptFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...findJavaScriptFiles(fullPath));
    if (entry.isFile() && entry.name.endsWith(".js")) files.push(fullPath);
  }
  return files.sort();
}

const files = findJavaScriptFiles("src");
if (files.length === 0) {
  console.error("FAIL: no JavaScript source files found under src/");
  process.exit(1);
}

for (const file of files) {
  const result = cp.spawnSync(process.execPath, ["--check", file], {
    encoding: "utf8",
  });
  if (result.status !== 0) {
    process.stderr.write(result.stderr);
    process.exit(result.status || 1);
  }
}
