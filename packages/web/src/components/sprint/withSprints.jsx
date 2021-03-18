import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { selectSprints } from "../../scripts/redux/selectors/sprints";
import { selectTasks } from "../../scripts/redux/selectors/tasks";

export default WrappedComponent => props => {
  const allTasks = useSelector(selectTasks);
  const allSprints = useSelector(selectSprints);

  const sprintsWithTasks = useMemo(
    () =>
      allSprints.map(({ tasks, tasksCompleted, ...sprint }) => ({
        tasks: allTasks.whereIn("uuid", tasks),
        tasksCompleted: allTasks.whereIn("uuid", tasksCompleted),
        ...sprint
      })),
    [allSprints, allTasks]
  );

  return <WrappedComponent {...props} sprints={sprintsWithTasks} />;
};
