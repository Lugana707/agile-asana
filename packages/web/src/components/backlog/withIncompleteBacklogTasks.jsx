import React, { useMemo } from "react";
import collect from "collect.js";
import withCurrentSprint from "../sprint/withCurrentSprint";
import withBacklogTasks from "./withBacklogTasks";

export default WrappedComponent =>
  withBacklogTasks(
    withCurrentSprint(({ backlogTasks, currentSprint, ...props }) => {
      const { uuid: currentSprintUUID } = currentSprint || {};

      const backlogTasksCollection = useMemo(
        () =>
          collect(backlogTasks || [])
            .where("completedAt", false)
            .where("mostRecentSprint", "!==", currentSprintUUID),
        [backlogTasks, currentSprintUUID]
      );

      return (
        <WrappedComponent
          {...props}
          incompleteBacklogTasks={backlogTasksCollection}
        />
      );
    })
  );
