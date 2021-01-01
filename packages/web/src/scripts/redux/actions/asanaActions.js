import axios from "axios";
import Asana from "asana";
import Logger from "js-logger";
import camelcase from "camelcase";
import collect from "collect.js";
import moment from "moment";
import { ASANA_API_URL } from "../../api";
import { isLoading } from "../../helpers";

const SET_LOADING_ASANA_PROJECTS = "SET_LOADING_ASANAPROJECTS";
const SUCCESS_LOADING_ASANA_PROJECTS = "SUCCESS_LOADING_ASANAPROJECTS";

const SET_LOADING_ASANA_TASKS = "SET_LOADING_ASANATASKS";
const SUCCESS_LOADING_ASANA_TASKS = "SUCCESS_LOADING_ASANATASKS";

const MATCH_PROJECT_KANBAN = /^(Dev|Product) Kanban Week \d\d?/u;
const MATCH_PROJECT_BACKLOG = /^Product Backlog$/u;

const getAsanaApiClient = ({ settings }) => {
  const { asanaApiKey } = settings;

  const client = Asana.Client.create().useAccessToken(asanaApiKey);
  const { gid: workspace } = settings.asanaDefaultWorkspace;

  return {
    client,
    workspace
  };
};

const getProjects = async archived => {
  const url = `${ASANA_API_URL}/projects`;
  Logger.debug("Getting project list from API...", { url, archived });

  const { data } = await axios.get(url, {
    params: {
      opt_fields: ["sections", "name", "created_at", "due_on", "start_on"].join(
        ","
      ),
      archived
    },
    validateStatus: status => status === 200
  });

  const matchKanban = MATCH_PROJECT_KANBAN;
  const matchBacklog = MATCH_PROJECT_BACKLOG;

  const projects = data.data
    .map(project => ({ ...project, archived }))
    .filter(({ name }) => matchKanban.test(name) || matchBacklog.test(name));
  Logger.debug("Gotten project list from API!", { projects });

  return projects;
};

const getTasks = async (asanaClient, { gid: projectGid, name }) => {
  Logger.trace("Getting project tasks from API...", { projectGid });

  const collection = await asanaClient.tasks.getTasks({
    project: projectGid,
    // opt_expand: ".",
    opt_fields: [
      "name",
      "created_at",
      "completed_at",
      "started_at",
      "custom_fields",
      "tags.(name|color)",
      "due_on",
      "notes",
      "assignee.(name|email|photo)",
      "memberships.(project.name|section.name)"
    ]
  });

  const tasks = await collection.fetch();
  Logger.debug("Gotten project tasks from API!", {
    project: name,
    tasks
  });

  return tasks;
};

const loadProjects = async dispatch => {
  try {
    dispatch({ type: SET_LOADING_ASANA_PROJECTS, loading: true });

    const asanaProjects = collect(
      await Promise.all([await getProjects(true), await getProjects(false)])
    ).flatten(1);

    dispatch({
      type: SUCCESS_LOADING_ASANA_PROJECTS,
      loading: false,
      value: { asanaProjects },
      timestamp: new Date()
    });

    return asanaProjects;
  } catch (error) {
    dispatch({ type: SET_LOADING_ASANA_PROJECTS, loading: false });
    Logger.error(error.callStack || error);
    return false;
  }
};

const loadTasks = async (dispatch, getState, { asanaProjects }) => {
  try {
    dispatch({ type: SET_LOADING_ASANA_TASKS, loading: true });

    const { client } = getAsanaApiClient(getState());

    const { asanaTasks } = getState().asanaTasks;

    const tasksCollection = collect(
      await Promise.all(asanaProjects.map(project => getTasks(client, project)))
    )
      .flatten(1)
      .unique("gid")
      .map(({ custom_fields, ...task }) => ({
        ...task,
        ...custom_fields.reduce(
          (accumulator, { name, number_value, enum_value }) => ({
            [camelcase(name)]: number_value || enum_value,
            ...accumulator
          }),
          {}
        )
      }));

    const taskKeyMap = tasksCollection
      .mapWithKeys(({ gid }) => [gid, true])
      .all();
    const merged = tasksCollection.merge(
      collect(asanaTasks)
        .filter(({ gid }) => !taskKeyMap[gid])
        .all()
    );

    dispatch({
      type: SUCCESS_LOADING_ASANA_TASKS,
      loading: false,
      value: { asanaTasks: merged.toArray() },
      timestamp: new Date()
    });

    return asanaTasks;
  } catch (error) {
    dispatch({ type: SET_LOADING_ASANA_TASKS, loading: false });
    Logger.error(error.callStack || error);
    return false;
  }
};

const lookForNewProjects = ({ forceReload = false } = {}) => {
  return async (dispatch, getState) => {
    const state = getState();

    const { asanaApiKey } = state.settings;
    if (!asanaApiKey) {
      Logger.warn("Cannot look for new projects, asanaApiKey is false!");
      return false;
    }

    if (isLoading(state)) {
      return false;
    }

    const currentAsanaProjects = collect(state.asanaProjects.asanaProjects);

    const asanaProjects = await loadProjects(dispatch);

    const newAsanaProjects = collect(asanaProjects).filter(
      ({ gid }) => !currentAsanaProjects.contains("gid", gid)
    );

    if (!forceReload && newAsanaProjects.isEmpty()) {
      Logger.debug("No new projects found!");
      return false;
    }

    await loadTasks(dispatch, getState, {
      asanaProjects
    });
  };
};

const loadAll = () => lookForNewProjects({ forceReload: true });

const reloadProject = ({ projects }) => {
  return async (dispatch, getState) => {
    if (!projects || projects.isEmpty()) {
      Logger.error("Cannot reload project, gid is falsey!", { projects });
      return false;
    }

    const state = getState();

    const { asanaApiKey } = state.settings;
    if (!asanaApiKey) {
      Logger.warn("Cannot look for new projects, asanaApiKey is false!");
      return false;
    }

    if (isLoading(state)) {
      return false;
    }

    await loadTasks(dispatch, getState, {
      asanaProjects: projects
    });
  };
};

const reloadRecentProjects = () => {
  return (dispatch, getState) => {
    const { asanaProjects } = getState().asanaProjects;

    dispatch(
      reloadProject({
        projects: collect(asanaProjects)
          .sortByDesc(({ created_at }) => moment(created_at).unix())
          .take(2)
          .merge(
            collect(asanaProjects)
              .filter(({ name }) => MATCH_PROJECT_BACKLOG.test(name))
              .all()
          )
          .where()
      })
    );
    dispatch(lookForNewProjects());
  };
};

export {
  loadAll,
  lookForNewProjects,
  reloadProject,
  reloadRecentProjects,
  MATCH_PROJECT_BACKLOG
};
