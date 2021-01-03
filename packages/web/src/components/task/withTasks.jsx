import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import collect from "collect.js";
import withGetTask from "./withGetTask";

export default WrappedComponent =>
  withGetTask(({ getTask, ...props }) => {
    const { data: tasks } = useSelector(state => state.tasks);

    const tasksCollectionWithInlineTasks = useMemo(
      () =>
        collect(tasks)
          .pluck("uuid")
          .map(uuid => getTask(uuid)),
      [tasks, getTask]
    );

    return (
      <WrappedComponent {...props} tasks={tasksCollectionWithInlineTasks} />
    );
  });
