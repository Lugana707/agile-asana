import axios from "axios";
import jsLogger from "js-logger";
import async from "async";
import { ASANA_API_URL } from "../../../api";

const RUNNING_AVERAGE_WEEK_COUNT = 3;

const SET_LOADING_RAW_PROJECT_TASKS = "SET_LOADING_RAWPROJECTTASKS";
const SUCCESS_LOADING_RAW_PROJECT_TASKS = "SUCCESS_LOADING_RAWPROJECTTASKS";

const SET_LOADING_ASANA_PROJECT_TASKS = "SET_LOADING_ASANAPROJECTTASKS";
const SUCCESS_LOADING_ASANA_PROJECT_TASKS = "SUCCESS_LOADING_ASANAPROJECTTASKS";

const loadProjectTasks = ({ asanaProjects }) => {
  return async dispatch => {
    try {
      dispatch({ type: SET_LOADING_RAW_PROJECT_TASKS, loading: true });

      const url = `${ASANA_API_URL}/projects`;
      jsLogger.debug("Getting project tasks from API...", {
        asanaProjects,
        url
      });

      const rawProjectTasks = await async.mapLimit(
        asanaProjects,
        5,
        async ({ gid, ...project }) => {
          const { data } = await axios.get(`${ASANA_API_URL}/tasks`, {
            params: {
              opt_fields: [
                "projects",
                "name",
                "completed_at",
                "started_at",
                "custom_fields"
              ].join(","),
              project: gid
            }
          });
          return {
            gid,
            ...project,
            tasks: data.data
          };
        }
      );
      jsLogger.debug("Gotten project tasks!", { rawProjectTasks });

      dispatch({
        type: SUCCESS_LOADING_RAW_PROJECT_TASKS,
        loading: false,
        value: { rawProjectTasks },
        timestamp: new Date()
      });
      dispatch(processProjectTasks({ rawProjectTasks }));
    } catch (error) {
      dispatch({ type: SET_LOADING_RAW_PROJECT_TASKS, loading: false });
      jsLogger.error(error.callStack || error);
    }
  };
};

const processProjectTasks = ({ rawProjectTasks }) => {
  return async dispatch => {
    try {
      dispatch({ type: SET_LOADING_ASANA_PROJECT_TASKS, loading: true });

      jsLogger.debug("Weighting project tasks for...", { rawProjectTasks });
      let tasksFound = {};
      const asanaProjectTasks = rawProjectTasks
        .map(({ tasks, ...project }) => {
          const parsedTasks = tasks.map(({ custom_fields, ...task }) => {
            const customFields = custom_fields.reduce(
              (accumulator, { name, number_value, enum_value }) => ({
                [name]: number_value || enum_value,
                ...accumulator
              }),
              {}
            );
            return {
              ...task,
              ...customFields,
              custom_fields
            };
          });

          const completedTasks = parsedTasks.filter(
            ({ gid, completed_at }) => completed_at && !tasksFound[gid]
          );
          tasksFound = completedTasks.reduce(
            (accumulator, { gid }) => ({ ...accumulator, [gid]: true }),
            tasksFound
          );

          const completedTasksWeight = completedTasks.reduce(
            (accumulator, { projects }) =>
              accumulator +
              projects.filter(project =>
                rawProjectTasks.some(({ gid }) => gid === project.gid)
              ).length,
            0
          );

          const sumStoryPoints = tasks =>
            tasks.reduce(
              (accumulator, { "Story Points": storyPoints = 0 }) =>
                accumulator + parseInt(storyPoints, 10),
              0
            );

          const completedStoryPoints = sumStoryPoints(completedTasks);

          return {
            ...project,
            tasks: parsedTasks,
            completedTasks,
            completedTasksWeight,
            completedTasksOverweight:
              completedTasksWeight - completedTasks.length,
            committedStoryPoints: sumStoryPoints(parsedTasks),
            completedStoryPoints
          };
        })
        .map((project, index, projects) => {
          const runningAverageCompletedStoryPoints = Math.round(
            projects
              .slice(index, index + RUNNING_AVERAGE_WEEK_COUNT)
              .reduce(
                (accumulator, { completedStoryPoints }) =>
                  accumulator + completedStoryPoints,
                0
              ) / RUNNING_AVERAGE_WEEK_COUNT
          );
          return {
            ...project,
            runningAverageCompletedStoryPoints
          };
        });

      jsLogger.debug("Finished processing tasks!", { asanaProjectTasks });

      dispatch({
        type: SUCCESS_LOADING_ASANA_PROJECT_TASKS,
        loading: false,
        value: { asanaProjectTasks },
        timestamp: new Date()
      });
    } catch (error) {
      dispatch({ type: SET_LOADING_ASANA_PROJECT_TASKS, loading: false });
      jsLogger.error(error.callStack || error);
    }
  };
};

export { loadProjectTasks, processProjectTasks };
