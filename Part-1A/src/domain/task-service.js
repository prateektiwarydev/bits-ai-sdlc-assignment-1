const validation = require("./validation");

function error(code) {
  const err = new Error(code);
  err.code = code;
  return err;
}

function cloneCollection(collection) {
  return structuredClone(collection);
}

function createTask(collection, input) {
  const values = validation.validateTaskInput(input);
  const next = cloneCollection(collection);
  const sequence = next.nextId;
  const task = {
    id: String(sequence),
    sequence,
    ...values,
  };
  next.tasks.push(task);
  next.nextId = next.nextId + 1;
  return next;
}

function getTask(collection, id) {
  if (typeof id !== "string" || id.trim().length === 0) {
    throw error("INVALID_INPUT");
  }
  const task = collection.tasks.find((item) => item.id === id);
  if (!task) throw error("TASK_NOT_FOUND");
  return structuredClone(task);
}

function listTasks(collection) {
  return structuredClone(collection.tasks);
}

function updateTask(collection, id, changes) {
  if (typeof id !== "string" || id.trim().length === 0) {
    throw error("INVALID_INPUT");
  }
  if (
    !changes ||
    typeof changes !== "object" ||
    Array.isArray(changes) ||
    Object.prototype.hasOwnProperty.call(changes, "id") ||
    Object.prototype.hasOwnProperty.call(changes, "status")
  ) {
    throw error("INVALID_INPUT");
  }

  const index = collection.tasks.findIndex((item) => item.id === id);
  if (index === -1) throw error("TASK_NOT_FOUND");

  const current = collection.tasks[index];
  const candidate = {
    title: Object.prototype.hasOwnProperty.call(changes, "title")
      ? changes.title
      : current.title,
    description: Object.prototype.hasOwnProperty.call(changes, "description")
      ? changes.description
      : current.description,
    tags: Object.prototype.hasOwnProperty.call(changes, "tags")
      ? changes.tags
      : current.tags,
    priority: Object.prototype.hasOwnProperty.call(changes, "priority")
      ? changes.priority
      : current.priority,
  };

  const values = validation.validateTaskInput(candidate);
  const next = cloneCollection(collection);
  next.tasks[index] = {
    ...next.tasks[index],
    title: values.title,
    description: values.description,
    tags: [...values.tags],
    priority: values.priority,
  };
  return next;
}

function deleteTask(collection, id) {
  if (typeof id !== "string" || id.trim().length === 0) {
    throw error("INVALID_INPUT");
  }
  const index = collection.tasks.findIndex((item) => item.id === id);
  if (index === -1) throw error("TASK_NOT_FOUND");
  const next = cloneCollection(collection);
  next.tasks.splice(index, 1);
  return next;
}

function filterTasksByTag(tasks, tag) {
  if (typeof tag !== "string" || tag.trim().length === 0) {
    throw error("INVALID_INPUT");
  }
  const normalized = tag.trim().toLowerCase();
  return structuredClone(
    tasks.filter((task) =>
      task.tags.some((item) =>
        typeof item === "string" &&
        item.trim().toLowerCase() === normalized
      ),
    ),
  );
}

function sortTasksByPriority(tasks) {
  const ranks = { HIGH: 0, MEDIUM: 1, LOW: 2 };
  return structuredClone(tasks)
    .map((task, index) => ({ task, index }))
    .sort((left, right) => {
      const priorityDifference =
        ranks[left.task.priority] - ranks[right.task.priority];
      return priorityDifference !== 0
        ? priorityDifference
        : left.index - right.index;
    })
    .map((entry) => entry.task);
}

function transitionTaskStatus(task, nextStatus) {
  if (
    !task ||
    typeof task !== "object" ||
    typeof nextStatus !== "string"
  ) {
    throw error("INVALID_INPUT");
  }
  const allowed =
    (task.status === "TODO" && nextStatus === "IN_PROGRESS") ||
    (task.status === "IN_PROGRESS" && nextStatus === "DONE");
  if (!allowed) throw error("INVALID_TRANSITION");
  return {
    ...structuredClone(task),
    status: nextStatus,
  };
}

module.exports = {
  createTask,
  getTask,
  listTasks,
  updateTask,
  deleteTask,
  filterTasksByTag,
  sortTasksByPriority,
  transitionTaskStatus,
};
