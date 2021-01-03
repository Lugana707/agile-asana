import React, { useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import collect from "collect.js";
import withSprints from "../sprint/withSprints";
import withCurrentSprint from "../sprint/withCurrentSprint";
import withForecastSprints from "../backlog/withForecastSprints";

export default WrappedComponent =>
  withForecastSprints(
    withCurrentSprint(
      withSprints(({ sprints, forecastSprints, currentSprint, ...props }) => {
        const { data: tasks } = useSelector(state => state.tasks);

        const tasksCollection = useMemo(() => collect(tasks), [tasks]);

        const getTask = useCallback(
          uuid => {
            const task = tasksCollection.firstWhere("uuid", uuid);

            if (!task) {
              return false;
            }

            const { parent, subtasks, dependencies, dependents } = task;

            return {
              ...task,
              parent: parent && tasksCollection.firstWhere("uuid", parent),
              subtasks: tasksCollection.whereIn("uuid", subtasks),
              dependencies: tasksCollection.whereIn("uuid", dependencies),
              dependents: tasksCollection.whereIn("uuid", dependents),
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
      })
    )
  );
