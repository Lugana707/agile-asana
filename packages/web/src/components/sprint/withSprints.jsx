import React, { useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import collect from "collect.js";
import moment from "moment";
import {
  MATCH_PROJECT_KANBAN,
  MATCH_PROJECT_KANBAN_WITHOUT_NUMBER
} from "../../scripts/redux/actions/asanaActions";
import withTasks from "../task/withTasks";

const RUNNING_AVERAGE_WEEK_COUNT = 3;

export default WrappedComponent =>
  withTasks(({ tasks, ...props }) => {
    const { data: asanaProjects } = useSelector(state => state.asanaProjects);

    const asanaProjectsCollection = useMemo(
      () =>
        collect(asanaProjects).filter(({ name }) =>
          MATCH_PROJECT_KANBAN.test(name)
        ),
      [asanaProjects]
    );

    const tasksCollection = useMemo(() => collect(tasks), [tasks]);

    const parseProjectIntoSprint = useCallback(
      project => {
        const {
          gid,
          archived,
          name,
          due_on,
          start_on,
          created_at,
          permalink_url,
          tasks
        } = project;

        const sprintTasksCollection = tasksCollection.whereIn("uuid", tasks);

        const tasksCompletedCollection = sprintTasksCollection
          .filter(task => !!task.completedAt)
          .where("mostRecentSprint", gid);

        const sumStoryPoints = collection =>
          collection
            .pluck("storyPoints")
            .filter()
            .sum();

        const storyPoints = sumStoryPoints(sprintTasksCollection);
        const completedStoryPoints = sumStoryPoints(tasksCompletedCollection);

        const week = parseInt(
          name.replace(MATCH_PROJECT_KANBAN_WITHOUT_NUMBER, "").trim(),
          10
        );

        const finishedOn = moment(due_on);
        const startOn = moment(start_on || created_at);
        const sprintLength = finishedOn.diff(
          startOn.format("YYYY-MM-DD"),
          "days"
        );

        return {
          uuid: gid,
          number: week,
          state: archived ? "COMPLETED" : "ACTIVE",
          storyPoints,
          completedStoryPoints,
          startOn,
          finishedOn,
          sprintLength,
          tasks: sprintTasksCollection.all(),
          tasksCompleted: tasksCompletedCollection.all(),
          externalLink: permalink_url
        };
      },
      [tasksCollection]
    );

    const sprintCollection = useMemo(
      () =>
        asanaProjectsCollection
          .map(project => parseProjectIntoSprint(project))
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
      [asanaProjectsCollection, parseProjectIntoSprint]
    );

    return <WrappedComponent {...props} sprints={sprintCollection} />;
  });
