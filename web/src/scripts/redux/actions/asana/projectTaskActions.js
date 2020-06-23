import axios from "axios";
import jsLogger from "js-logger";
import async from "async";
import { ASANA_API_URL } from "../../../api";

const SET_LOADING_ASANA_PROJECT_TASKS = "SET_LOADING_ASANAPROJECTTASKS";
const SUCCESS_LOADING_ASANA_PROJECT_TASKS = "SUCCESS_LOADING_ASANAPROJECTTASKS";

const loadProjectTasks = ({ asanaProjects }) => {
  return async dispatch => {
    try {
      dispatch({ type: SET_LOADING_ASANA_PROJECT_TASKS, loading: true });

      const url = `${ASANA_API_URL}/projects`;
      jsLogger.debug("Getting project tasks from API...", {
        asanaProjects,
        url
      });

      const asanaProjectTasks = await async.mapLimit(
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
      jsLogger.debug("Gotten project tasks!", { asanaProjectTasks });

      jsLogger.debug("Weighting project tasks for...", { asanaProjectTasks });
      let tasksFound = {};
      const weightedProjectTasks = asanaProjectTasks.map(
        ({ tasks, ...project }) => {
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
            ({ gid }) => !tasksFound[gid]
          );
          tasksFound = completedTasks.reduce(
            (accumulator, { gid }) => ({ ...accumulator, [gid]: true }),
            tasksFound
          );

          const completedTasksWeight = completedTasks.reduce(
            (accumulator, { projects }) =>
              accumulator +
              projects.filter(project =>
                asanaProjectTasks.some(({ gid }) => gid === project.gid)
              ).length,
            0
          );

          const sumStoryPoints = tasks =>
            tasks.reduce(
              (accumulator, { "Story Points": storyPoints = 0 }) =>
                accumulator + parseInt(storyPoints, 10),
              0
            );

          return {
            ...project,
            tasks: parsedTasks,
            completedTasks,
            completedTasksWeight,
            completedTasksOverweight:
              completedTasksWeight - completedTasks.length,
            committedStoryPoints: sumStoryPoints(parsedTasks),
            completedStoryPoints: sumStoryPoints(completedTasks)
          };
        }
      );
      jsLogger.debug("Weighted project tasks!", { weightedProjectTasks });

      dispatch({
        type: SUCCESS_LOADING_ASANA_PROJECT_TASKS,
        loading: false,
        value: { asanaProjectTasks: weightedProjectTasks },
        timestamp: new Date()
      });
    } catch (error) {
      dispatch({ type: SET_LOADING_ASANA_PROJECT_TASKS, loading: false });
      jsLogger.error(error.callStack || error);
    }
  };
};

export { loadProjectTasks };
