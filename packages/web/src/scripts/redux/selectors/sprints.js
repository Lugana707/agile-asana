import { createSelector } from "reselect";
import collect from "collect.js";
import moment from "moment";
import {
  MATCH_PROJECT_KANBAN,
  MATCH_PROJECT_KANBAN_WITHOUT_NUMBER
} from "../actions/asanaActions";
import { releases } from "./code";

const RUNNING_AVERAGE_WEEK_COUNT = 3;

const parseProjectIntoSprint = (asanaProject, asanaProjects, asanaTasks) => {
  const {
    gid,
    archived,
    name,
    due_on,
    start_on,
    created_at,
    permalink_url,
    tasks,
    sections
  } = asanaProject;

  const sprintTasksCollection = collect(asanaTasks).whereIn("gid", tasks || []);

  const tasksCompletedCollection = sprintTasksCollection
    .filter(task => !!task.completed_at)
    .filter(
      ({ memberships }) =>
        collect(memberships)
          .pluck("project.gid")
          .pipe(projects =>
            collect(asanaProjects).whereIn("gid", projects.toArray())
          )
          .filter()
          .filter(project => MATCH_PROJECT_KANBAN.test(project.name))
          .sortBy(project => moment(project.created_at).unix())
          .pluck("gid")
          .last() === gid
    );

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

  const finishedOn = moment(due_on || moment());
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
    tasks: sprintTasksCollection.pluck("gid").toArray(),
    tasksCompleted: tasksCompletedCollection.pluck("gid").toArray(),
    externalLink: permalink_url,
    state: archived ? "COMPLETED" : "ACTIVE",
    isCurrentSprint: !archived,
    isCompletedSprint: archived,
    customFieldNames: sprintTasksCollection
      .pluck("custom_fields")
      .filter()
      .flatten(1)
      .pluck("name")
      .unique()
      .sort(),
    sections: collect(sections).map(section => ({
      uuid: section.gid,
      name: section.name
    }))
  };
};

export const selectSprints = createSelector(
  state => state.asanaProjects.data,
  state => state.asanaTasks.data,
  releases,
  (asanaProjects, asanaTasks, releases) =>
    collect(asanaProjects)
      .filter(({ name }) => MATCH_PROJECT_KANBAN.test(name))
      .map(asanaProject =>
        parseProjectIntoSprint(asanaProject, asanaProjects, asanaTasks)
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
        ),
        releases: releases
          .where("draft", false)
          .where("prerelease", false)
          .filter(({ publishedAt }) =>
            publishedAt.isBetween(sprint.startOn, sprint.finishedOn)
          )
          .sortByDesc(({ publishedAt }) => publishedAt.unix())
      }))
);

export const selectCurrentSprint = createSelector(
  selectSprints,
  sprintsCollection => sprintsCollection.firstWhere("isCurrentSprint", true)
);
