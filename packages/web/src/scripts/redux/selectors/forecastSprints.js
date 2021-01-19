import { createSelector } from "reselect";
import collect from "collect.js";
import moment from "moment";
import { MATCH_PROJECT_BACKLOG } from "../actions/asanaActions";
import { selectTasks } from "./tasks";
import { selectCurrentSprint } from "./sprints";

export const selectForecastSprints = createSelector(
  state => state.asanaProjects.data,
  selectTasks,
  selectCurrentSprint,
  (asanaProjects, tasksCollection, currentSprint) =>
    collect(asanaProjects)
      .filter(
        ({ name }) =>
          MATCH_PROJECT_BACKLOG.test(name) && /\WRefined/iu.test(name)
      )
      .pluck("tasks")
      .flatten(1)
      .map(uuid => tasksCollection.firstWhere("uuid", uuid))
      .where()
      .where("completedAt", false)
      .where("mostRecentSprint", "!==", currentSprint.uuid)
      .where("storyPoints")
      .reduce((accumulator, currentValue) => {
        const storyPoints = currentValue.storyPoints || 0;
        let sprint = accumulator.firstWhere(
          "storyPoints",
          "<=",
          currentSprint.averageCompletedStoryPoints - storyPoints
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
        completedAt: moment(currentSprint.completedAt).add(index + 1, "weeks"),
        averageCompletedStoryPoints: false,
        tasks
      }))
);
