#!/usr/bin/env bash

ROOT=$(cd "$(dirname "$0")/.." && pwd)
cd "$ROOT" || exit 1

ARG=${1:-preimplementation}
STAMP=$(date -u +"%Y%m%dT%H%M%SZ")-$$
case "$ARG" in
  evidence/initial|initial)
    EVIDENCE_DIR="$ROOT/evidence/initial/$STAMP"
    ;;
  evidence/final|final)
    EVIDENCE_DIR="$ROOT/evidence/final/$STAMP"
    ;;
  *)
    EVIDENCE_DIR="$ROOT/evidence/harness/$STAMP-$ARG"
    ;;
esac
mkdir -p "$EVIDENCE_DIR" || exit 1

SUMMARY="$EVIDENCE_DIR/summary.json"
GATE1_STATUS=0
GATE2_STATUS=0
GATE3_STATUS=0

# Gate 1: discover and syntax-check each source file, then run ESLint.
SYNTAX_LOG="$EVIDENCE_DIR/gate1-syntax"
SOURCE_FILES=$(find src -type f -name '*.js' 2>/dev/null | sort)
if [ -z "$SOURCE_FILES" ]; then
  printf 'FAIL: no JavaScript source files found under src/\n' > "$SYNTAX_LOG.stdout"
  : > "$SYNTAX_LOG.stderr"
  printf '{"exitCode":1}\n' > "$SYNTAX_LOG.json"
  SYNTAX_STATUS=1
else
  SYNTAX_STATUS=0
  : > "$SYNTAX_LOG.stdout"
  : > "$SYNTAX_LOG.stderr"
  while IFS= read -r file; do
    node --check "$file" >> "$SYNTAX_LOG.stdout" 2>> "$SYNTAX_LOG.stderr"
    status=$?
    if [ "$status" -ne 0 ]; then SYNTAX_STATUS=$status; fi
  done <<< "$SOURCE_FILES"
  printf '{"exitCode":%d}\n' "$SYNTAX_STATUS" > "$SYNTAX_LOG.json"
fi

LINT_LOG="$EVIDENCE_DIR/gate1-eslint"
npx --no-install eslint --config .harness/eslint.config.js "src/**/*.js" "tests/**/*.js" \
  > "$LINT_LOG.stdout" 2> "$LINT_LOG.stderr"
LINT_STATUS=$?
printf '{"exitCode":%d}\n' "$LINT_STATUS" > "$LINT_LOG.json"

if [ -z "$SOURCE_FILES" ] || [ "$SYNTAX_STATUS" -ne 0 ] || [ "$LINT_STATUS" -ne 0 ]; then
  GATE1_STATUS=1
fi

# Gate 2: real Semgrep scan with valid JSON report validation.
SEMGREP_LOG="$EVIDENCE_DIR/gate2-semgrep"
SEMGREP_JSON="$EVIDENCE_DIR/semgrep.json"
if [ -z "$SOURCE_FILES" ] || ! command -v semgrep >/dev/null 2>&1; then
  if [ -z "$SOURCE_FILES" ]; then
    printf 'FAIL: no application JavaScript source found under src/\n' > "$SEMGREP_LOG.stdout"
  else
    printf 'FAIL: semgrep is not installed\n' > "$SEMGREP_LOG.stdout"
  fi
  : > "$SEMGREP_LOG.stderr"
  printf '{"exitCode":1}\n' > "$SEMGREP_LOG.json"
  GATE2_STATUS=1
else
  semgrep scan \
    --config p/javascript --config p/security-audit \
    --config .harness/semgrep.yml --error --json \
    --output "$SEMGREP_JSON" src \
    > "$SEMGREP_LOG.stdout" 2> "$SEMGREP_LOG.stderr"
  SEMGREP_STATUS=$?
  printf '{"exitCode":%d}\n' "$SEMGREP_STATUS" > "$SEMGREP_LOG.json"

  node -e '
    const fs=require("node:fs");
    const file=process.argv[1];
    let report;
    try { report=JSON.parse(fs.readFileSync(file,"utf8")); }
    catch (_) { process.exit(1); }
    if (!report || !Array.isArray(report.results) || !Array.isArray(report.errors)) process.exit(1);
    if (report.errors.length !== 0) process.exit(1);
    if (report.results.length !== 0) process.exit(1);
    const paths = report.paths && Array.isArray(report.paths.scanned)
      ? report.paths.scanned
      : [];
    const scannedApplicationJs = paths.some((value) =>
      typeof value === "string" &&
      value.endsWith(".js") &&
      (value === "src" || value.startsWith("src/") || value.includes("/src/"))
    );
    if (!scannedApplicationJs) process.exit(1);
  ' "$SEMGREP_JSON"
  REPORT_STATUS=$?
  if [ "$SEMGREP_STATUS" -ne 0 ] || [ "$REPORT_STATUS" -ne 0 ]; then
    GATE2_STATUS=1
  fi
fi

# Gate 3: both suites must exist and execute actual tests.
TEST_LOG="$EVIDENCE_DIR/gate3-tests"
UNIT_FILES=$(find tests/unit -type f -name '*.test.js' 2>/dev/null)
CONTRACT_FILES=$(find tests/contract -type f -name '*.test.js' 2>/dev/null)
if [ -z "$UNIT_FILES" ] || [ -z "$CONTRACT_FILES" ]; then
  printf 'FAIL: unit or contract test suite is missing\n' > "$TEST_LOG.stdout"
  printf 'Both tests/unit and tests/contract need test files\n' > "$TEST_LOG.stderr"
  printf '{"exitCode":1}\n' > "$TEST_LOG.json"
  GATE3_STATUS=1
else
  node --test "tests/**/*.test.js" > "$TEST_LOG.stdout" 2> "$TEST_LOG.stderr"
  TEST_STATUS=$?
  printf '{"exitCode":%d}\n' "$TEST_STATUS" > "$TEST_LOG.json"

  node -e '
    const fs=require("node:fs");
    const text=(fs.existsSync(process.argv[1])?fs.readFileSync(process.argv[1],"utf8"):"") +
               (fs.existsSync(process.argv[2])?fs.readFileSync(process.argv[2],"utf8"):"");
    const match=text.match(/# tests (\d+)/);
    if (!match || Number(match[1]) === 0) process.exit(1);
  ' "$TEST_LOG.stdout" "$TEST_LOG.stderr"
  ZERO_STATUS=$?
  if [ "$TEST_STATUS" -ne 0 ] || [ "$ZERO_STATUS" -ne 0 ]; then
    GATE3_STATUS=1
  fi
fi

OVERALL=0
if [ "$GATE1_STATUS" -ne 0 ] || [ "$GATE2_STATUS" -ne 0 ] || [ "$GATE3_STATUS" -ne 0 ]; then
  OVERALL=1
fi

node - "$SUMMARY" "$ARG" "$GATE1_STATUS" "$GATE2_STATUS" "$GATE3_STATUS" "$OVERALL" <<'NODE'
const fs = require("node:fs");
const [, , out, run, g1, g2, g3, overall] = process.argv;
const summary = {
  run,
  gate1SyntaxLint: Number(g1),
  gate2Sast: Number(g2),
  gate3Tests: Number(g3),
  overall: Number(overall) === 0 ? "PASS" : "FAIL",
};
fs.writeFileSync(out, `${JSON.stringify(summary, null, 2)}\n`);
NODE

exit "$OVERALL"
