import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import collect from "collect.js";

export default WrappedComponent => props => {
  const { backlogTasks } = useSelector(state => state.backlogTasks);

  const backlogTasksCollection = useMemo(() => collect(backlogTasks || []), [
    backlogTasks
  ]);

  return <WrappedComponent {...props} backlogTasks={backlogTasksCollection} />;
};
