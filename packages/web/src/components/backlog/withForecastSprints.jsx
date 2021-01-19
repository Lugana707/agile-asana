import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import moment from "moment";
import collect from "collect.js";
import withTasks from "../task/withTasks";
import withCurrentSprint from "../sprint/withCurrentSprint";
import { MATCH_PROJECT_BACKLOG } from "../../scripts/redux/actions/asanaActions";

export default WrappedComponent =>
  withCurrentSprint(
    withTasks(({ currentSprint, tasks, ...props }) => {
      const { data: asanaProjects } = useSelector(state => state.asanaProjects);

      const refinedBacklogTasks = useMemo(
        () =>
          collect(asanaProjects)
            .filter(
              ({ name }) =>
                MATCH_PROJECT_BACKLOG.test(name) && /\WRefined/iu.test(name)
            )
            .pluck("tasks")
            .flatten(1),
        [asanaProjects]
      );

      const taskCollection = useMemo(() => collect(tasks), [tasks]);

      const forecastSprints = useMemo(() => {
        if (!currentSprint) {
          return collect([]);
        }

        const {
          averageCompletedStoryPoints: forecastStoryPoints
        } = currentSprint;

        return refinedBacklogTasks
          .map(uuid => taskCollection.firstWhere("uuid", uuid))
          .where()
          .where("completedAt", false)
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
            isForecastSprint: true,
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
      }, [currentSprint, refinedBacklogTasks, taskCollection]);

      return <WrappedComponent {...props} forecastSprints={forecastSprints} />;
    })
  );
