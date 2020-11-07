import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import collect from "collect.js";

export default WrappedComponent => props => {
  const { sprints } = useSelector(state => state.sprints);

  const completedSprints = useMemo(
    () =>
      collect(sprints)
        .where("state", "COMPLETED")
        .sortByDesc("week"),
    [sprints]
  );

  return <WrappedComponent {...props} completedSprints={completedSprints} />;
};
