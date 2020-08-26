import Logger from "js-logger";
import moment from "moment";
import collect from "collect.js";

const MATCH_PROJECT_BACKLOG = /^Product Backlog$/u;

const SET_LOADING_SPRINTS = "SET_LOADING_SPRINTS";
const DELETE_SPRINT = "DELETE_SPRINT";
const ADD_SPRINT = "ADD_SPRINT";

const processBacklogIntoForecastedSprints = ({
  sprints,
  asanaProjectBacklog,
  asanaTasks
}) => {
  const [currentSprint] = sprints.filter(({ state }) => state === "ACTIVE");

  const refined = collect(asanaTasks)
    .filter(task => collect(task.projects).contains(asanaProjectBacklog.gid))
    .filter(task =>
      collect(task.sections).contains(
        value => value.toLowerCase() === "refined"
      )
    )
    .all();

  const { averageCompletedStoryPoints: forecastStoryPoints } = currentSprint;

  Logger.debug("Processing backlog tasks into forecasted sprints...", {
    forecastStoryPoints,
    refined
  });

  let taskIndex = 0;
  let totalStoryPoints = 0;

  return refined
    .filter(
      ({ projects }) =>
        !projects.map(({ gid }) => gid).includes(currentSprint.uuid)
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
      storyPoints: tasks.reduce(
        (accumulator, { storyPoints = 0 }) => accumulator + storyPoints,
        0
      ),
      startOn: moment(currentSprint.startOn)
        .add("weeks", index + 1)
        .format(),
      finishedOn: moment(currentSprint.finishedOn)
        .add("weeks", index + 1)
        .format(),
      averageCompletedStoryPoints: false,
      tasks
    }));
};

const processProjectIntoSprint = ({ asanaProject, asanaTasks }) => {
  Logger.debug("Processing project into sprint...", { asanaProject });

  const {
    gid,
    archived,
    name,
    dueOn,
    startOn,
    runningAverageCompletedStoryPoints
  } = asanaProject;

  const tasks = asanaTasks.filter(task =>
    collect(task.projects).contains("gid", gid)
  );

  const week = parseInt(name.replace(/.+ Kanban Week /u, "").trim(), 10);

  return {
    uuid: gid,
    number: week,
    state: archived ? "COMPLETED" : "ACTIVE",
    storyPoints: undefined,
    startOn,
    finishedOn: dueOn,
    averageCompletedStoryPoints: runningAverageCompletedStoryPoints,
    tasks
  };
};

const processBacklogAndProjectsFromAsana = ({ refined, projects }) => {
  return async dispatch => {
    dispatch({ type: SET_LOADING_SPRINTS, loading: true });

    Logger.info("Processing projects into historic sprints...", {
      projects
    });
    const sprints = projects.map(project => {
      const sprint = processProjectIntoSprint({ project });
      dispatch({ type: DELETE_SPRINT, value: sprint, loading: true });
      dispatch({ type: ADD_SPRINT, value: sprint, loading: true });
      return sprint;
    });

    Logger.info("Processing backlog into forecasted sprints...", {
      refined
    });
    processBacklogIntoForecastedSprints({
      sprints,
      refined
    }).forEach(sprint => {
      dispatch({ type: DELETE_SPRINT, value: sprint, loading: true });
      dispatch({ type: ADD_SPRINT, value: sprint, loading: true });
    });

    dispatch({ type: SET_LOADING_SPRINTS, loading: false });
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

      Logger.info("Processing projects into historic sprints...", {
        asanaProjects,
        asanaTasks
      });
      const sprints = asanaProjects
        .filter(({ name }) => !matchBacklog.test(name))
        .map(asanaProject => {
          const sprint = processProjectIntoSprint({ asanaProject, asanaTasks });
          dispatch({ type: DELETE_SPRINT, value: sprint, loading: true });
          dispatch({ type: ADD_SPRINT, value: sprint, loading: true });
          return sprint;
        });

      const [asanaProjectBacklog] = asanaProjects.filter(({ name }) =>
        matchBacklog.test(name)
      );
      Logger.info("Processing backlog into forecasted sprints...", {
        sprints,
        asanaProjectBacklog,
        asanaTasks
      });
      processBacklogIntoForecastedSprints({
        sprints,
        asanaProjectBacklog,
        asanaTasks
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
