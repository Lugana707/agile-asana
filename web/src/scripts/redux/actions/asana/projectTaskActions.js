import axios from "axios";
import jsLogger from "js-logger";
import camelcase from "camelcase";
import { ASANA_API_URL } from "../../../api";

const RUNNING_AVERAGE_WEEK_COUNT = 3;

const SET_LOADING_RAW_PROJECT_TASKS = "SET_LOADING_RAWPROJECTTASKS";
const SUCCESS_LOADING_RAW_PROJECT_TASKS = "SUCCESS_LOADING_RAWPROJECTTASKS";

const SUCCESS_LOADING_RAW_BACKLOG_TASKS = "SUCCESS_LOADING_RAWBACKLOGTASKS";

const SET_LOADING_ASANA_PROJECT_TASKS = "SET_LOADING_ASANAPROJECTTASKS";
const SUCCESS_LOADING_ASANA_PROJECT_TASKS = "SUCCESS_LOADING_ASANAPROJECTTASKS";

const processProjectTasks = ({ rawProjectTasks }) => {
  return async dispatch => {
    try {
      dispatch({ type: SET_LOADING_ASANA_PROJECT_TASKS, loading: true });

      jsLogger.debug("Processing project tasks...", { rawProjectTasks });
      let tasksFound = {};
      const asanaProjectTasks = rawProjectTasks
        .map(({ tasks, ...project }) => {
          const parsedTasks = tasks.map(({ custom_fields, ...task }) => {
            const customFields = custom_fields.reduce(
              (accumulator, { name, number_value, enum_value }) => ({
                [camelcase(name)]: number_value || enum_value,
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
              projects.filter(obj =>
                rawProjectTasks.some(({ gid }) => gid === obj.gid)
              ).length,
            0
          );

          const sumStoryPoints = projectTasks =>
            projectTasks.reduce(
              (accumulator, { storyPoints = 0 }) =>
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

const loadProjectTasks = ({ asanaProjects, asanaBacklog }) => {
  return async dispatch => {
    try {
      dispatch({ type: SET_LOADING_RAW_PROJECT_TASKS, loading: true });

      const url = `${ASANA_API_URL}/projects`;
      jsLogger.debug("Getting project tasks from API...", {
        asanaProjects,
        asanaBacklog,
        url
      });

      const getProjectTasksFromApi = async ({ gid, ...project }) => {
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
      };

      const rawProjectTasks = await Promise.all(
        asanaProjects.map(async obj => await getProjectTasksFromApi(obj))
      );
      const rawBacklogTasks = await getProjectTasksFromApi(asanaBacklog);
      jsLogger.debug("Gotten project tasks!", {
        rawProjectTasks,
        rawBacklogTasks
      });

      dispatch({
        type: SUCCESS_LOADING_RAW_PROJECT_TASKS,
        loading: false,
        value: { rawProjectTasks },
        timestamp: new Date()
      });
      dispatch({
        type: SUCCESS_LOADING_RAW_BACKLOG_TASKS,
        loading: false,
        value: rawBacklogTasks,
        timestamp: new Date()
      });
      dispatch(processProjectTasks({ rawProjectTasks }));
    } catch (error) {
      dispatch({ type: SET_LOADING_RAW_PROJECT_TASKS, loading: false });
      jsLogger.error(error.callStack || error);
    }
  };
};

export { loadProjectTasks, processProjectTasks };
