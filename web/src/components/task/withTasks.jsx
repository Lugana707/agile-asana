import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import collect from "collect.js";

export default WrappedComponent => props => {
  const { sprints } = useSelector(state => state.sprints);

  const tasksCollection = useMemo(
    () =>
      collect(sprints)
        .pluck("tasks")
        .flatten(1),
    [sprints]
  );

  return <WrappedComponent {...props} tasks={tasksCollection} />;
};
