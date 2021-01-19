import React from "react";
import { useSelector } from "react-redux";
import { selectTasks } from "../../scripts/redux/selectors/tasks";

export default WrappedComponent => props => {
  const tasks = useSelector(selectTasks);

  return <WrappedComponent {...props} tasks={tasks} />;
};
