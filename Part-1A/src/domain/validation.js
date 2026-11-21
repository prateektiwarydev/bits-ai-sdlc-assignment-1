const VALID_PRIORITIES = new Set(["HIGH", "MEDIUM", "LOW"]);

function error(code) {
  const err = new Error(code);
  err.code = code;
  return err;
}

function isNonblankString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function validateTaskInput(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw error("INVALID_INPUT");
  }
  if (!isNonblankString(input.title)) {
    throw error("INVALID_INPUT");
  }

  const description =
    input.description === undefined ? "" : input.description;
  if (typeof description !== "string") {
    throw error("INVALID_INPUT");
  }

  const tags =
    input.tags === undefined ? [] : input.tags;
  if (
    !Array.isArray(tags) ||
    tags.some((tag) => !isNonblankString(tag))
  ) {
    throw error("INVALID_INPUT");
  }

  const priority =
    input.priority === undefined ? "MEDIUM" : input.priority;
  if (typeof priority !== "string" || !VALID_PRIORITIES.has(priority)) {
    throw error("INVALID_INPUT");
  }

  return {
    title: input.title.trim(),
    description,
    tags: [...tags],
    priority,
    status: "TODO",
  };
}

module.exports = {
  validateTaskInput,
  isNonblankString,
  VALID_PRIORITIES,
  error,
};
