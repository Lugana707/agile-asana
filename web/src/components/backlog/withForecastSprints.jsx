import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import collect from "collect.js";

export default WrappedComponent => props => {
  const { sprints } = useSelector(state => state.sprints);

  const sprintCollection = useMemo(
    () =>
      collect(sprints)
        .where("state", "FORECAST")
        .sortByDesc("number"),
    [sprints]
  );

  return <WrappedComponent {...props} forecastSprints={sprintCollection} />;
};
