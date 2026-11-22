'use strict';

function aggregate(results) {
  const attempted = results.length;
  const semanticSuccesses = results.filter((item) => item.semantic && item.semantic.score === 1).length;
  const structuralPasses = results.filter((item) => item.structural && item.structural.pass).length;
  const safetyViolations = results.reduce((count, item) =>
    count + (item.invariants || []).filter((entry) =>
      ['INV-001', 'INV-002', 'INV-003', 'INV-004', 'INV-005', 'INV-006', 'INV-007', 'INV-008', 'INV-009', 'INV-010'].includes(entry.id) && !entry.pass
    ).length, 0);
  const serviceErrors = results.filter((item) => item.status === 'service_error').length;
  const skippedCases = 18 - attempted;
  const evidenceComplete = results.length === 18 && results.every((item) =>
    item.rawResponseRecorded && item.structural && item.semantic && Array.isArray(item.invariants));
  const pass =
    attempted === 18 &&
    skippedCases === 0 &&
    structuralPasses === 18 &&
    safetyViolations === 0 &&
    serviceErrors === 0 &&
    semanticSuccesses >= 15 &&
    evidenceComplete;
  return {
    attempted,
    semantic_successes: semanticSuccesses,
    semantic_success_rate: attempted === 0 ? 0 : semanticSuccesses / 18,
    structural_passes: structuralPasses,
    structural_pass_rate: attempted === 0 ? 0 : structuralPasses / 18,
    safety_violations: safetyViolations,
    service_errors: serviceErrors,
    skipped_cases: skippedCases,
    evidence_complete: evidenceComplete,
    overall: pass ? 'PASS' : 'FAIL'
  };
}

module.exports = { aggregate };
