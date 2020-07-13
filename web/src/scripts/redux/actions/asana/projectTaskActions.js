import axios from "axios";
import jsLogger from "js-logger";
import camelcase from "camelcase";
import moment from "moment";
import { ASANA_API_URL } from "../../../api";

const RUNNING_AVERAGE_WEEK_COUNT = 3;

const SET_LOADING_RAW_PROJECT_TASKS = "SET_LOADING_RAWPROJECTTASKS";
const SUCCESS_LOADING_RAW_PROJECT_TASKS = "SUCCESS_LOADING_RAWPROJECTTASKS";

const SUCCESS_LOADING_RAW_BACKLOG_TASKS = "SUCCESS_LOADING_RAWBACKLOGTASKS";

const SET_LOADING_ASANA_PROJECT_TASKS = "SET_LOADING_ASANAPROJECTTASKS";
const SUCCESS_LOADING_ASANA_PROJECT_TASKS = "SUCCESS_LOADING_ASANAPROJECTTASKS";

const SET_LOADING_BACKLOG_TASKS = "SET_LOADING_BACKLOGTASKS";
const SUCCESS_LOADING_BACKLOG_TASKS = "SUCCESS_LOADING_BACKLOGTASKS";

const sumStoryPoints = projectTasks =>
  projectTasks.reduce(
    (accumulator, { storyPoints = 0 }) =>
      accumulator + parseInt(storyPoints, 10),
    0
  );

const processProjectTasksForProject = (
  { tasks, ...project },
  { sprintStartDay = 2 }
) => {
  const parsedTasks = tasks.map(({ custom_fields, completed_at, ...task }) => {
    let mergeFields = { completed_at };

    jsLogger.trace("Processing task custom fields...", { custom_fields });
    mergeFields = {
      ...mergeFields,
      ...custom_fields.reduce(
        (accumulator, { name, number_value, enum_value }) => ({
          [camelcase(name)]: number_value || enum_value,
          ...accumulator
        }),
        {}
      )
    };

    if (completed_at) {
      jsLogger.trace("Processing task for sprint metrics...", {
        completed_at,
        sprintStartDay
      });
      const completedAt = moment(completed_at);
      const completedAtDayOfWeek = parseInt(completedAt.format("d"), 10);
      mergeFields = {
        ...mergeFields,
        completedAt: {
          dayOfWeek: completedAtDayOfWeek,
          dayOfSprint: (completedAtDayOfWeek + 7 - sprintStartDay) % 7
        }
      };
    }

    return {
      ...task,
      ...mergeFields
    };
  });

  return {
    ...project,
    tasks: parsedTasks,
    committedStoryPoints: sumStoryPoints(parsedTasks)
  };
};

const processProjectTasks = ({ rawProjectTasks }) => {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: SET_LOADING_ASANA_PROJECT_TASKS, loading: true });

      const { settings } = getState();

      jsLogger.debug("Processing project tasks...", { rawProjectTasks });
      let tasksFound = {};
      const asanaProjectTasks = rawProjectTasks
        .map(project => processProjectTasksForProject(project, settings))
        .map(project => {
          const completedTasks = project.tasks.filter(
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

          const completedStoryPoints = sumStoryPoints(completedTasks);

          return {
            completedTasks,
            completedTasksWeight,
            completedTasksOverweight:
              completedTasksWeight - completedTasks.length,
            completedStoryPoints,
            ...project
          };
        })
        .map((project, index, projects) => {
          const offset = project.archived ? 0 : 1;
          const runningAverageCompletedStoryPoints = Math.round(
            projects
              .slice(
                index + offset,
                index + offset + RUNNING_AVERAGE_WEEK_COUNT
              )
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

const processBacklogTasks = ({ rawBacklogTasks }) => {
  return (dispatch, getState) => {
    try {
      dispatch({ type: SET_LOADING_BACKLOG_TASKS, loading: true });

      const { settings } = getState();

      const { sections, tasks, ...backlog } = processProjectTasksForProject(
        rawBacklogTasks,
        settings
      );

      const sectionTasks = sections.reduce(
        (accumulator, { name }) => ({
          ...accumulator,
          [camelcase(name)]: tasks
            .filter(obj => !obj.completed_at)
            .filter(({ section }) => section.name === name)
        }),
        {}
      );

      dispatch({
        type: SUCCESS_LOADING_BACKLOG_TASKS,
        loading: false,
        value: {
          sections,
          ...sectionTasks,
          ...backlog
        },
        timestamp: new Date()
      });
    } catch (error) {
      dispatch({ type: SET_LOADING_BACKLOG_TASKS, loading: false });
      jsLogger.error(error.callStack || error);
    }
  };
};

const reprocessAllTasks = () => {
  return (dispatch, getState) => {
    const { rawBacklogTasks, ...state } = getState();

    const { rawProjectTasks } = state.rawProjectTasks;

    dispatch(processProjectTasks({ rawProjectTasks }));
    dispatch(processBacklogTasks({ rawBacklogTasks }));
  };
};

const loadProjectTasks = ({ asanaProjects, asanaBacklog }) => {
  return async dispatch => {
    try {
      dispatch({ type: SET_LOADING_RAW_PROJECT_TASKS, loading: true });

      const getProjectTasksFromApi = async ({ sections, ...project }) => {
        jsLogger.debug("Getting project tasks from API...", {
          sections,
          project
        });

        const tasks = await Promise.all(
          sections.map(async ({ gid, ...section }) => {
            const url = `${ASANA_API_URL}/sections/${gid}/tasks`;
            jsLogger.trace("Getting project tasks from API...", {
              url,
              sectionGid: gid
            });

            const { data } = await axios.get(url, {
              params: {
                opt_fields: [
                  "projects",
                  "name",
                  "completed_at",
                  "started_at",
                  "custom_fields"
                ].join(",")
              }
            });

            const combined = data.data.map(task => ({
              ...task,
              section: { gid, ...section }
            }));

            jsLogger.trace("Gotten project tasks from API!", combined);

            return combined;
          })
        );

        const combined = {
          sections,
          ...project,
          tasks: tasks.flat()
        };

        jsLogger.debug("Gotten project tasks!", combined);

        return combined;
      };

      jsLogger.info("Loading project tasks...", {
        asanaProjects,
        asanaBacklog
      });
      const rawProjectTasks = await Promise.all(
        asanaProjects.map(async obj => await getProjectTasksFromApi(obj))
      );
      const rawBacklogTasks = await getProjectTasksFromApi(asanaBacklog);

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
      dispatch(processBacklogTasks({ rawBacklogTasks }));
    } catch (error) {
      dispatch({ type: SET_LOADING_RAW_PROJECT_TASKS, loading: false });
      jsLogger.error(error.callStack || error);
    }
  };
};

export { loadProjectTasks, reprocessAllTasks };
