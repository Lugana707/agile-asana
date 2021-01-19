import { createSelector } from "reselect";
import collect from "collect.js";
import moment from "moment";
import {
  MATCH_PROJECT_KANBAN,
  MATCH_PROJECT_KANBAN_WITHOUT_NUMBER
} from "../actions/asanaActions";
import { selectTasks } from "./tasks";

const RUNNING_AVERAGE_WEEK_COUNT = 3;

const parseProjectIntoSprint = (project, tasksCollection) => {
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

  const sprintTasksCollection = tasksCollection.whereIn("uuid", tasks || []);

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
  const sprintLength = finishedOn.diff(startOn.format("YYYY-MM-DD"), "days");

  return {
    uuid: gid,
    number: week,
    storyPoints,
    completedStoryPoints,
    startOn,
    finishedOn,
    sprintLength,
    tasks: sprintTasksCollection.all(),
    tasksCompleted: tasksCompletedCollection.all(),
    externalLink: permalink_url,
    state: archived ? "COMPLETED" : "ACTIVE",
    isCurrentSprint: !archived,
    isCompletedSprint: archived
  };
};

export const selectSprints = createSelector(
  state => state.asanaProjects.data,
  selectTasks,
  (asanaProjects, tasksCollection) =>
    collect(asanaProjects)
      .filter(({ name }) => MATCH_PROJECT_KANBAN.test(name))
      .map(asanaProject =>
        parseProjectIntoSprint(asanaProject, tasksCollection)
      )
      .sortByDesc("number")
      .map((sprint, index, array) => ({
        ...sprint,
        averageCompletedStoryPoints: Math.round(
          collect(array)
            .where("number", "<=", sprint.number)
            .take(RUNNING_AVERAGE_WEEK_COUNT)
            .map(({ state, completedStoryPoints, storyPoints }) =>
              state === "COMPLETED" ? completedStoryPoints : storyPoints
            )
            .average()
        )
      }))
);

export const selectCurrentSprint = createSelector(
  selectSprints,
  sprintsCollection => sprintsCollection.firstWhere("isCurrentSprint", true)
);
