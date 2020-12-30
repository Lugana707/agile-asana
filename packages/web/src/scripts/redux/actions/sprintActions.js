import Logger from "js-logger";
import moment from "moment";
import collect from "collect.js";

const MATCH_PROJECT_BACKLOG = /^Product Backlog$/u;

const SUCCESS_LOADING_BACKLOG_TASKS = "SUCCESS_LOADING_BACKLOGTASKS";
const SUCCESS_LOADING_REFINED_BACKLOG_TASKS =
  "SUCCESS_LOADING_REFINEDBACKLOGTASKS";
const SUCCESS_LOADING_UNREFINED_BACKLOG_TASKS =
  "SUCCESS_LOADING_UNREFINEDBACKLOGTASKS";

const processTasks = ({ asanaTasks, asanaProjectsCollection }) =>
  collect(asanaTasks)
    .map(
      ({
        gid,
        name,
        due_on,
        created_at,
        completed_at,
        storyPoints,
        tags,
        sections,
        projects
      }) => ({
        uuid: gid,
        name,
        dueOn: due_on ? moment(due_on) : false,
        createdAt: created_at ? moment(created_at) : false,
        completedAt: completed_at ? moment(completed_at) : false,
        storyPoints,
        tags,
        sections,
        sprints: projects
      })
    )
    .map(task => {
      const mostRecentSprint = collect(task.sprints)
        .map(uuid => asanaProjectsCollection.firstWhere("gid", uuid))
        .filter()
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

  const { gid, archived, name, due_on, start_on, created_at } = asanaProject;

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

  const week = parseInt(name.replace(/.+ Kanban Week /u, "").trim(), 10);

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
    tasksCompleted: tasksCompletedCollection.all()
  };
};

const processSprints = () => {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: "BEGIN_LOADING_SPRINTS" });

      const state = getState();

      const { asanaProjects } = state.asanaProjects;
      const { asanaTasks } = state.asanaTasks;

      if (!asanaProjects || !asanaTasks) {
        return false;
      }

      const asanaProjectsCollection = collect(asanaProjects);

      const matchBacklog = MATCH_PROJECT_BACKLOG;
      const asanaProjectBacklog = asanaProjectsCollection
        .filter(({ name }) => matchBacklog.test(name))
        .first();

      const tasksCollection = processTasks({
        asanaTasks,
        asanaProjectsCollection
      });

      Logger.info("Processing projects into historic sprints...", {
        asanaProjectsCollection,
        tasksCollection
      });
      const sprints = asanaProjectsCollection
        .filter(({ name }) => !matchBacklog.test(name))
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
        })
        .toArray();

      Logger.info("Processing tasks into refined and unrefined...", {
        tasksCollection
      });
      const backlogTasks = tasksCollection.filter(task =>
        collect(task.sprints).contains(asanaProjectBacklog.gid)
      );
      const refinedBacklogTasks = backlogTasks
        .where("completedAt", false)
        .filter(
          task =>
            !collect(task.sprints).contains(uuid =>
              collect(sprints)
                .pluck("uuid")
                .contains(uuid)
            )
        )
        .filter(task =>
          collect(task.sections).contains(
            value => value.toLowerCase() === "refined"
          )
        );
      const unrefinedBacklogTasks = tasksCollection
        .where("completedAt", false)
        .filter(task =>
          collect(task.sections).contains(
            value => value.toLowerCase() === "unrefined"
          )
        );

      dispatch({
        type: SUCCESS_LOADING_BACKLOG_TASKS,
        value: {
          backlogTasks: backlogTasks.all()
        },
        backlog: undefined,
        tasks: backlogTasks.toArray(),
        loading: false
      });
      dispatch({
        type: SUCCESS_LOADING_REFINED_BACKLOG_TASKS,
        value: { refinedBacklogTasks: refinedBacklogTasks.all() },
        loading: false
      });
      dispatch({
        type: SUCCESS_LOADING_UNREFINED_BACKLOG_TASKS,
        value: { unrefinedBacklogTasks: unrefinedBacklogTasks.all() },
        loading: false
      });
    } catch (error) {
      Logger.error(error);
    }

    dispatch({ type: "FINISH_LOADING_SPRINTS" });
  };
};

export { processSprints };
