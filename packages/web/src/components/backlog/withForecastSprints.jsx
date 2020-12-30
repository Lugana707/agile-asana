import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import moment from "moment";
import collect from "collect.js";
import withCurrentSprint from "../sprint/withCurrentSprint";

export default WrappedComponent =>
  withCurrentSprint(({ currentSprint, ...props }) => {
    const { refinedBacklogTasks } = useSelector(
      state => state.refinedBacklogTasks
    );

    const forecastSprints = useMemo(() => {
      if (!currentSprint) {
        return collect([]);
      }

      const {
        averageCompletedStoryPoints: forecastStoryPoints
      } = currentSprint;

      return collect(refinedBacklogTasks)
        .where("mostRecentSprint", "!==", currentSprint.uuid)
        .where("storyPoints")
        .reduce((accumulator, currentValue) => {
          const storyPoints = currentValue.storyPoints || 0;
          let sprint = accumulator.firstWhere(
            "storyPoints",
            "<=",
            forecastStoryPoints - storyPoints
          );

          if (!sprint) {
            sprint = { storyPoints: 0, tasks: [] };
            accumulator.push(sprint);
          }

          sprint.tasks.push(currentValue);
          sprint.storyPoints += storyPoints;

          return accumulator;
        }, collect([]))
        .map(({ tasks, storyPoints }, index) => ({
          uuid: false,
          number: index + 1 + currentSprint.number,
          state: "FORECAST",
          storyPoints,
          startOn: moment(currentSprint.startOn).add(index + 1, "weeks"),
          completedAt: moment(currentSprint.completedAt).add(
            index + 1,
            "weeks"
          ),
          averageCompletedStoryPoints: false,
          tasks
        }));
    }, [currentSprint, refinedBacklogTasks]);

    return <WrappedComponent {...props} forecastSprints={forecastSprints} />;
  });
