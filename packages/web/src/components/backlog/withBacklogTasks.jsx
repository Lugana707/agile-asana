import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import collect from "collect.js";
import withTasks from "../task/withTasks";

export default WrappedComponent =>
  withTasks(({ tasks, ...props }) => {
    const { data: asanaProjects } = useSelector(state => state.asanaProjects);

    const taskCollection = useMemo(() => collect(tasks), [tasks]);

    const backlogTasksCollection = useMemo(
      () =>
        collect(asanaProjects)
          .where("isBacklog", true)
          .pluck("tasks")
          .flatten(1)
          .unique()
          .map(uuid => taskCollection.firstWhere("uuid", uuid))
          .where(),
      [asanaProjects, taskCollection]
    );

    return (
      <WrappedComponent {...props} backlogTasks={backlogTasksCollection} />
    );
  });
