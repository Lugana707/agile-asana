import Logger from "js-logger";
import moment from "moment";
import collect from "collect.js";

const RUNNING_AVERAGE_WEEK_COUNT = 3;

const MATCH_PROJECT_BACKLOG = /^Product Backlog$/u;

const SET_LOADING_SPRINTS = "SET_LOADING_SPRINTS";
const DELETE_SPRINT = "DELETE_SPRINT";
const ADD_SPRINT = "ADD_SPRINT";

const SUCCESS_LOADING_REFINED_BACKLOG_TASKS =
  "SUCCESS_LOADING_REFINEDBACKLOGTASKS";
const SUCCESS_LOADING_UNREFINED_BACKLOG_TASKS =
  "SUCCESS_LOADING_UNREFINEDBACKLOGTASKS";

const processTasks = ({ asanaTasks }) =>
  collect(asanaTasks)
    .map(
      ({
        gid,
        name,
        due_on,
        completed_at,
        storyPoints,
        tags,
        sections,
        projects
      }) => ({
        uuid: gid,
        name,
        dueOn: due_on ? moment(due_on) : false,
        completedAt: completed_at ? moment(completed_at) : false,
        storyPoints,
        tags,
        sections,
        sprints: projects
      })
    )
    .all();

const processBacklogIntoForecastedSprints = ({
  sprints,
  asanaProjectBacklog,
  refinedBacklogTasks
}) => {
  const [currentSprint] = sprints.filter(({ state }) => state === "ACTIVE");

  const { averageCompletedStoryPoints: forecastStoryPoints } = currentSprint;

  Logger.debug("Processing backlog tasks into forecasted sprints...", {
    forecastStoryPoints,
    refinedBacklogTasks
  });

  let taskIndex = 0;
  let totalStoryPoints = 0;

  return refinedBacklogTasks
    .filter(
      ({ sprints }) =>
        !collect(sprints)
          .pluck("uuid")
          .filter()
          .contains(currentSprint.uuid)
    )
    .reduce((accumulator, currentValue) => {
      const { storyPoints = 0 } = currentValue;
      totalStoryPoints = totalStoryPoints + storyPoints;

      if (totalStoryPoints >= forecastStoryPoints) {
        taskIndex = taskIndex + 1;
        totalStoryPoints = storyPoints;
      }

      let tasks = [...accumulator];
      tasks[taskIndex] = (accumulator[taskIndex] || []).concat([currentValue]);

      return tasks;
    }, [])
    .map((tasks, index) => ({
      uuid: false,
      number: index + 1 + currentSprint.number,
      state: "FORECAST",
      storyPoints: collect(tasks)
        .pluck("storyPoints")
        .filter()
        .sum(),
      startOn: moment(currentSprint.startOn).add("weeks", index + 1),
      completedAt: moment(currentSprint.completedAt).add("weeks", index + 1),
      averageCompletedStoryPoints: false,
      tasks
    }));
};

const processProjectIntoSprint = ({ asanaProject, tasks, sprints }) => {
  Logger.debug("Processing project into sprint...", { asanaProject });

  const { gid, archived, name, due_on, start_on, created_at } = asanaProject;

  const tasksCollection = collect(tasks).filter(task =>
    collect(task.sprints).contains(gid)
  );

  const week = parseInt(name.replace(/.+ Kanban Week /u, "").trim(), 10);

  const averageCompletedStoryPoints = collect(sprints)
    .reverse()
    .take(3)
    .pluck("storyPoints")
    .median();

  return {
    uuid: gid,
    number: week,
    state: archived ? "COMPLETED" : "ACTIVE",
    storyPoints: tasksCollection
      .pluck("storyPoints")
      .filter()
      .sum(),
    startOn: moment(start_on || created_at),
    finishedOn: moment(due_on),
    averageCompletedStoryPoints,
    tasks: tasksCollection.all()
  };
};

const processSprints = () => {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: SET_LOADING_SPRINTS, loading: true });

      const state = getState();

      const { asanaProjects } = state.asanaProjects;
      const { asanaTasks } = state.asanaTasks;

      if (!asanaProjects || !asanaTasks) {
        return false;
      }

      const matchBacklog = MATCH_PROJECT_BACKLOG;
      const [asanaProjectBacklog] = asanaProjects.filter(({ name }) =>
        matchBacklog.test(name)
      );

      const tasksCollection = collect(processTasks({ asanaTasks }));

      Logger.info("Processing projects into historic sprints...", {
        asanaProjects,
        tasksCollection
      });
      const sprints = [];
      collect(asanaProjects)
        .filter(({ name }) => !matchBacklog.test(name))
        .each(asanaProject => {
          const sprint = processProjectIntoSprint({
            asanaProject,
            tasks: tasksCollection.all(),
            sprints
          });
          dispatch({ type: DELETE_SPRINT, value: sprint, loading: true });
          dispatch({ type: ADD_SPRINT, value: sprint, loading: true });
          sprints.push(sprint);
        });

      Logger.info("Processing tasks into refined and unrefined...", {
        tasksCollection
      });
      const refinedBacklogTasks = tasksCollection
        .where("completedAt", false)
        .filter(task => collect(task.sprints).contains(asanaProjectBacklog.gid))
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
        )
        .all();
      const unrefinedBacklogTasks = tasksCollection
        .where("completedAt", false)
        .filter(task =>
          collect(task.sections).contains(
            value => value.toLowerCase() === "unrefined"
          )
        )
        .all();
      dispatch({
        type: SUCCESS_LOADING_REFINED_BACKLOG_TASKS,
        value: { refinedBacklogTasks },
        loading: false
      });
      dispatch({
        type: SUCCESS_LOADING_UNREFINED_BACKLOG_TASKS,
        value: { unrefinedBacklogTasks },
        loading: false
      });

      Logger.info("Processing backlog into forecasted sprints...", {
        sprints,
        asanaProjectBacklog,
        refinedBacklogTasks
      });
      processBacklogIntoForecastedSprints({
        sprints,
        asanaProjectBacklog,
        refinedBacklogTasks
      }).forEach(sprint => {
        dispatch({ type: DELETE_SPRINT, value: sprint, loading: true });
        dispatch({ type: ADD_SPRINT, value: sprint, loading: true });
      });
    } catch (error) {
      Logger.error(error);
      dispatch({ type: SET_LOADING_SPRINTS, loading: false });
    }
  };
};

export { processSprints };
