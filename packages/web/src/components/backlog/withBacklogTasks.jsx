import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import collect from "collect.js";
import withTasks from "../task/withTasks";
import { MATCH_PROJECT_BACKLOG } from "../../scripts/redux/actions/asanaActions";

export default WrappedComponent =>
  withTasks(({ tasks, ...props }) => {
    const { data: asanaProjects } = useSelector(state => state.asanaProjects);

    const taskCollection = useMemo(() => collect(tasks), [tasks]);

    const backlogTasksCollection = useMemo(
      () =>
        collect(asanaProjects)
          .filter(({ name }) => MATCH_PROJECT_BACKLOG.test(name))
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
