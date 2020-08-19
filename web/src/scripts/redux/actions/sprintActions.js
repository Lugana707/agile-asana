import Logger from "js-logger";
import moment from "moment";

const SET_LOADING_SPRINTS = "SET_LOADING_SPRINTS";
const DELETE_SPRINT = "DELETE_SPRINT";
const ADD_SPRINT = "ADD_SPRINT";

const processBacklogIntoForecastedSprints = ({ sprints, refined }) => {
  const [currentSprint] = sprints.filter(({ state }) => state === "ACTIVE");

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

const processBacklogAndProjectsFromAsana = ({ refined, projects }) => {
  return async dispatch => {
    dispatch({ type: SET_LOADING_SPRINTS, loading: true });

    Logger.info("TODO: Processing projects into historic sprints...", {
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

const processProjectIntoSprint = ({ project }) => {
  Logger.debug("Processing project into sprint...", { project });

  const {
    gid,
    week,
    tasks,
    dueOn,
    startOn,
    runningAverageCompletedStoryPoints
  } = project;

  return {
    uuid: gid,
    number: week,
    state: project.archived ? "COMPLETED" : "ACTIVE",
    storyPoints: undefined,
    startOn,
    finishedOn: dueOn,
    averageCompletedStoryPoints: runningAverageCompletedStoryPoints,
    tasks
  };
};

const reprocessSprints = () => {
  return (dispatch, getState) => {
    const state = getState();

    const { refined } = state.backlogTasks;
    const { asanaProjectTasks: projects } = state.asanaProjectTasks;

    if (!refined || !projects) {
      return false;
    }

    dispatch(
      processBacklogAndProjectsFromAsana({
        refined,
        projects
      })
    );
  };
};

export { reprocessSprints };
