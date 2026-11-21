const argsModule = require("./cli/args");
const presentation = require("./cli/presentation");
const taskService = require("./domain/task-service");
const jsonStore = require("./persistence/json-store");

function isErrorCode(error, code) {
  return error && error.code === code;
}

function resolveErrorCode(error) {
  if (isErrorCode(error, "INVALID_JSON")) return "INVALID_JSON";
  if (isErrorCode(error, "TASK_NOT_FOUND")) return "TASK_NOT_FOUND";
  if (isErrorCode(error, "INVALID_TRANSITION")) return "INVALID_TRANSITION";
  return "INVALID_INPUT";
}

function exitStatus(code) {
  if (code === "INVALID_INPUT") return 2;
  if (code === "TASK_NOT_FOUND") return 3;
  if (code === "INVALID_TRANSITION") return 4;
  if (code === "INVALID_JSON") return 5;
  return 1;
}

function run(argv) {
  if (!Array.isArray(argv) || argv.length < 2) {
    const payload = presentation.failure("task", "INVALID_INPUT");
    presentation.writeResult("task", payload, 2);
    return;
  }
  if (argv[0] !== "task") {
    const payload = presentation.failure("task", "INVALID_INPUT");
    presentation.writeResult("task", payload, 2);
    return;
  }

  const operation = argv[1];
  let args;
  try {
    args = argsModule.parseArgs(argv.slice(2));
  } catch (errorValue) {
    const code = resolveErrorCode(errorValue);
    const payload = presentation.failure(`task.${operation}`, code);
    presentation.writeResult(`task.${operation}`, payload, exitStatus(code));
    return;
  }

  const dataFile = argsModule.resolveDataFile(args);
  let collection;
  try {
    collection = jsonStore.loadStore(dataFile);
  } catch (errorValue) {
    const code = resolveErrorCode(errorValue);
    const payload = presentation.failure(`task.${operation}`, code);
    presentation.writeResult(`task.${operation}`, payload, exitStatus(code));
    return;
  }

  try {
    if (operation === "create") {
      const title = argsModule.requireValue(args, "title");
      const input = { title };
      if (args.description !== undefined) input.description = args.description;
      if (args.tags !== undefined) input.tags = args.tags;
      if (args.priority !== undefined) input.priority = args.priority;
      const next = taskService.createTask(collection, input);
      jsonStore.saveStore(dataFile, next);
      const created = next.tasks[next.tasks.length - 1];
      const payload = presentation.success("task.create", { task: created });
      presentation.writeResult("task.create", payload, 0);
      return;
    }

    if (operation === "get") {
      const id = argsModule.requireValue(args, "id");
      const task = taskService.getTask(collection, id);
      const payload = presentation.success("task.get", { task });
      presentation.writeResult("task.get", payload, 0);
      return;
    }

    if (operation === "list") {
      let tasks = taskService.listTasks(collection);
      if (args.sort !== undefined) {
        if (args.sort !== "priority") {
          throw { code: "INVALID_INPUT" };
        }
        tasks = taskService.sortTasksByPriority(tasks);
      }
      const payload = presentation.success("task.list", { tasks });
      presentation.writeResult("task.list", payload, 0);
      return;
    }

    if (operation === "update") {
      const id = argsModule.requireValue(args, "id");
      const changes = {};
      if (args.title !== undefined) changes.title = args.title;
      if (args.description !== undefined) changes.description = args.description;
      if (args.tags !== undefined) changes.tags = args.tags;
      if (args.priority !== undefined) changes.priority = args.priority;
      if (args.status !== undefined || args.id !== undefined) {
        if (args.status !== undefined) throw { code: "INVALID_INPUT" };
      }
      const next = taskService.updateTask(collection, id, changes);
      jsonStore.saveStore(dataFile, next);
      const task = taskService.getTask(next, id);
      const payload = presentation.success("task.update", { task });
      presentation.writeResult("task.update", payload, 0);
      return;
    }

    if (operation === "delete") {
      const id = argsModule.requireValue(args, "id");
      const next = taskService.deleteTask(collection, id);
      jsonStore.saveStore(dataFile, next);
      const payload = presentation.success("task.delete", { tasks: next.tasks });
      presentation.writeResult("task.delete", payload, 0);
      return;
    }

    if (operation === "filter-tag") {
      if (
        !Array.isArray(args.tags) ||
        args.tags.length !== 1
      ) {
        throw { code: "INVALID_INPUT" };
      }
      const tag = argsModule.requireValue(
        { tag: args.tags[0] },
        "tag",
      );
      const tasks = taskService.filterTasksByTag(
        taskService.listTasks(collection),
        tag,
      );
      const payload = presentation.success("task.filter-tag", { tasks });
      presentation.writeResult("task.filter-tag", payload, 0);
      return;
    }

    if (operation === "transition") {
      const id = argsModule.requireValue(args, "id");
      const nextStatus = argsModule.requireValue(args, "to");
      const current = taskService.getTask(collection, id);
      const changed = taskService.transitionTaskStatus(current, nextStatus);
      const next = structuredClone(collection);
      const index = next.tasks.findIndex((task) => task.id === id);
      next.tasks[index] = changed;
      jsonStore.saveStore(dataFile, next);
      const payload = presentation.success("task.transition", { task: changed });
      presentation.writeResult("task.transition", payload, 0);
      return;
    }

    const payload = presentation.failure("task", "INVALID_INPUT");
    presentation.writeResult("task", payload, 2);
  } catch (errorValue) {
    const code = resolveErrorCode(errorValue);
    const payload = presentation.failure(`task.${operation}`, code);
    presentation.writeResult(`task.${operation}`, payload, exitStatus(code));
  }
}

if (require.main === module) {
  run(process.argv.slice(2));
}

module.exports = { run };
