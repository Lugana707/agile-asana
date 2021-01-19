import Logger from "js-logger";
import moment from "moment";
import collect from "collect.js";
import {
  MATCH_PROJECT_BACKLOG,
  MATCH_PROJECT_KANBAN,
  MATCH_PROJECT_KANBAN_WITHOUT_NUMBER
} from "./asanaActions";

const processTasks = ({ asanaTasks, asanaProjectsCollection }) =>
  collect(asanaTasks)
    /* jshint maxcomplexity:false */
    .map(
      ({
        gid,
        name,
        due_on,
        created_at,
        completed_at,
        storyPoints,
        tags,
        memberships,
        notes,
        html_notes,
        assignee,
        created_by,
        permalink_url,
        parent,
        subtasks,
        custom_fields
      }) => ({
        uuid: gid,
        name,
        dueOn: due_on ? moment(due_on) : false,
        createdAt: created_at ? moment(created_at) : false,
        completedAt: completed_at ? moment(completed_at) : false,
        storyPoints,
        tags: collect(tags || [])
          .pluck("name")
          .toArray(),
        sections: collect(memberships || [])
          .pluck("section.name")
          .toArray(),
        sprints: collect(memberships || [])
          .pluck("project.gid")
          .toArray(),
        description: html_notes || notes,
        assignee,
        createdBy: created_by,
        externalLink: permalink_url,
        parent: parent && parent.gid,
        subtasks: collect(subtasks || [])
          .pluck("gid")
          .toArray(),
        customFields: collect(custom_fields || [])
          .where("enum_value")
          .map(({ name: customFieldName, enum_value }) => ({
            name: customFieldName,
            value: {
              color: enum_value.color,
              name: enum_value.name
            }
          }))
          .toArray()
      })
    )
    /* jshint maxcomplexity:6 */
    .map(task => {
      const mostRecentSprint = collect(task.sprints)
        .map(uuid => asanaProjectsCollection.firstWhere("gid", uuid))
        .filter()
        .filter(({ name }) => MATCH_PROJECT_KANBAN.test(name))
        .sortBy(({ created_at }) => moment(created_at).unix())
        .pluck("gid")
        .last();

      return {
        ...task,
        mostRecentSprint
      };
    })
    .map(task => {
      const { completedAt, mostRecentSprint } = task;
      if (completedAt && mostRecentSprint) {
        const asanaProject = asanaProjectsCollection.firstWhere(
          "gid",
          mostRecentSprint
        );
        const completedAtDayOfSprint =
          moment(asanaProject.created_at).weekday() +
          completedAt.diff(asanaProject.created_at, "days");
        return {
          ...task,
          completedAtDayOfSprint
        };
      }

      return task;
    });

const processProjectIntoSprint = ({
  asanaProject,
  tasksCollection,
  asanaProjectsCollection
}) => {
  Logger.debug("Processing project into sprint...", {
    asanaProject,
    tasksCollection,
    asanaProjectsCollection
  });

  const {
    gid,
    archived,
    name,
    due_on,
    start_on,
    created_at,
    permalink_url
  } = asanaProject;

  const sprintTasksCollection = tasksCollection.filter(task =>
    collect(task.sprints).contains(gid)
  );

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
};

const processSprints = () => {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: "BEGIN_LOADING_SPRINTS", loading: true });

      const state = getState();

      const { data: asanaProjects } = state.asanaProjects;
      const { data: asanaTasks } = state.asanaTasks;

      if (!asanaProjects || !asanaTasks) {
        return false;
      }

      const asanaProjectsCollection = collect(asanaProjects);

      const tasksCollection = processTasks({
        asanaTasks,
        asanaProjectsCollection
      });

      Logger.info("Processing projects into sprints...", {
        asanaProjectsCollection,
        tasksCollection
      });
      asanaProjectsCollection
        .filter(({ name }) => !MATCH_PROJECT_BACKLOG.test(name))
        .map(asanaProject =>
          processProjectIntoSprint({
            asanaProject,
            tasksCollection,
            asanaProjectsCollection
          })
        )
        .sortByDesc("number")
        .map(sprint => {
          dispatch({
            type: "SPRINT_ADDED",
            sprint,
            tasks: sprint.tasks,
            loading: true
          });
          return sprint;
        });
    } catch (error) {
      Logger.error(error);
    } finally {
      dispatch({ type: "FINISH_LOADING_SPRINTS", loading: false });
    }
  };
};

export { processSprints };
