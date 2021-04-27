import { createSelector } from "reselect";
import collect from "collect.js";
import moment from "moment";
import { selectTasks } from "./tasks";
import { selectSprints } from "./sprints";

export const selectForecastSprints = createSelector(
  state => state.asanaProjects.data,
  selectTasks,
  selectSprints,
  (asanaProjects, tasksCollection, sprints) => {
    const currentSprint = sprints.firstWhere("isCurrentSprint");

    return collect(asanaProjects)
      .filter(({ isBacklog, name }) => isBacklog && /\WRefined/iu.test(name))
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
      .map(({ tasks, storyPoints }, index) => {
        const completedAt = moment(currentSprint.completedAt).add(
          index + 1,
          "weeks"
        );

        return {
          uuid: false,
          number: index + 1 + currentSprint.number,
          isForecastSprint: true,
          state: "FORECAST",
          storyPoints,
          startOn: moment(currentSprint.startOn).add(index + 1, "weeks"),
          finishedOn: completedAt,
          completedAt,
          averageCompletedStoryPoints: false,
          tasks,
          releases: collect([]),
          customFieldNames: collect(tasks)
            .pluck("customFields")
            .flatten(1)
            .pluck("name")
            .unique()
            .sort()
        };
      });
  }
);
