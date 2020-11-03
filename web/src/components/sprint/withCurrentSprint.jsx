import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import collect from "collect.js";

export default WrappedComponent => props => {
  const { sprints } = useSelector(state => state.sprints);

  const sprint = useMemo(() => collect(sprints).firstWhere("state", "ACTIVE"), [
    sprints
  ]);

  if (!sprint) {
    return <div />;
  }

  return <WrappedComponent {...props} sprint={sprint} />;
};
