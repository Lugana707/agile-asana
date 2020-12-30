import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import collect from "collect.js";

export default WrappedComponent => props => {
  const { data: tasks } = useSelector(state => state.tasks);

  const tasksCollection = useMemo(() => collect(tasks), [tasks]);

  return <WrappedComponent {...props} tasks={tasksCollection} />;
};
