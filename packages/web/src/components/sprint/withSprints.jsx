import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import collect from "collect.js";

const RUNNING_AVERAGE_WEEK_COUNT = 3;

export default WrappedComponent => props => {
  const { data: sprints } = useSelector(state => state.sprints);

  const sprintCollection = useMemo(
    () =>
      collect(sprints)
        .whereIn("state", ["ACTIVE", "COMPLETED"])
        .sortByDesc("number")
        .map((sprint, index, array) => ({
          ...sprint,
          isCurrentSprint: sprint.state === "ACTIVE",
          isCompletedSprint: sprint.state === "COMPLETED",
          averageCompletedStoryPoints: Math.round(
            collect(array)
              .where("number", "<=", sprint.number)
              .take(RUNNING_AVERAGE_WEEK_COUNT)
              .map(({ state, completedStoryPoints, storyPoints }) =>
                state === "COMPLETED" ? completedStoryPoints : storyPoints
              )
              .average()
          )
        })),
    [sprints]
  );

  return <WrappedComponent {...props} sprints={sprintCollection} />;
};
