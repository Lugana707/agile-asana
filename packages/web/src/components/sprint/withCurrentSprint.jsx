import React from "react";
import { useSelector } from "react-redux";
import { selectSprints } from "../../scripts/redux/selectors/sprints";

export default WrappedComponent => props => {
  const sprints = useSelector(selectSprints);

  const currentSprints = sprints.where("isCurrentSprint");

  return (
    <WrappedComponent
      {...props}
      currentSprints={currentSprints}
      currentSprint={currentSprints.first()}
    />
  );
};
