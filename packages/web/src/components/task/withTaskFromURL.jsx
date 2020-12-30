import React, { useMemo } from "react";
import withTasks from "./withTasks";

export default WrappedComponent =>
  withTasks(({ tasks, match, ...props }) => {
    const { uuid } = match.params;

    const task = useMemo(() => tasks.firstWhere("uuid", uuid), [uuid, tasks]);

    return <WrappedComponent {...props} task={task} />;
  });
