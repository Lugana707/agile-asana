import React from "react";
import { useSelector } from "react-redux";
import { selectCurrentSprint } from "../../scripts/redux/selectors/sprints";

export default WrappedComponent => props => {
  const currentSprint = useSelector(selectCurrentSprint);

  return <WrappedComponent {...props} currentSprint={currentSprint} />;
};
