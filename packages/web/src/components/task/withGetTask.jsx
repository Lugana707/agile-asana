import React, { useMemo, useCallback } from "react";
import collect from "collect.js";
import withTasks from "./withTasks";
import withSprints from "../sprint/withSprints";
import withCurrentSprint from "../sprint/withCurrentSprint";
import withForecastSprints from "../backlog/withForecastSprints";

export default WrappedComponent =>
  withForecastSprints(
    withCurrentSprint(
      withSprints(
        withTasks(
          ({ sprints, forecastSprints, currentSprint, tasks, ...props }) => {
            const tasksCollection = useMemo(() => collect(tasks), [tasks]);

            const getTask = useCallback(
              uuid => {
                const task = tasksCollection.firstWhere("uuid", uuid);

                if (!task) {
                  return false;
                }

                const { parent, subtasks } = task;

                return {
                  ...task,
                  parent: parent && tasksCollection.firstWhere("uuid", parent),
                  subtasks: tasksCollection.whereIn("uuid", subtasks),
                  forecastSprint: forecastSprints
                    .merge(sprints.merge([currentSprint]).toArray())
                    .filter(
                      sprint => !!collect(sprint.tasks).firstWhere("uuid", uuid)
                    )
                    .first()
                };
              },
              [tasksCollection, forecastSprints, sprints, currentSprint]
            );

            return <WrappedComponent {...props} getTask={getTask} />;
          }
        )
      )
    )
  );
