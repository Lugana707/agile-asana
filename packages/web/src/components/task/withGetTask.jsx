import React, { useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import collect from "collect.js";

export default WrappedComponent => props => {
  const { data: tasks } = useSelector(state => state.tasks);

  const tasksCollection = useMemo(() => collect(tasks), [tasks]);

  const getTask = useCallback(
    uuid => {
      const task = tasksCollection.firstWhere("uuid", uuid);

      if (!task) {
        return false;
      }

      const { parent, subtasks, dependencies, dependents } = task;

      return {
        ...task,
        parent: tasksCollection.firstWhere("uuid", parent),
        subtasks: tasksCollection.whereIn("uuid", subtasks),
        dependencies: tasksCollection.whereIn("uuid", dependencies),
        dependents: tasksCollection.whereIn("uuid", dependents)
      };
    },
    [tasksCollection]
  );

  return <WrappedComponent {...props} getTask={getTask} />;
};
