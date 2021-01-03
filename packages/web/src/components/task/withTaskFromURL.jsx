import React, { useMemo } from "react";
import withGetTask from "./withGetTask";

export default WrappedComponent =>
  withGetTask(({ getTask, match, ...props }) => {
    const { uuid } = match.params;

    const task = useMemo(() => getTask(uuid), [uuid, getTask]);

    return <WrappedComponent {...props} task={task} />;
  });
