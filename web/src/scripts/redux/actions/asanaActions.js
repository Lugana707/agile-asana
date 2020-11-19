import axios from "axios";
import Asana from "asana";
import Logger from "js-logger";
import camelcase from "camelcase";
import collect from "collect.js";
import { ASANA_API_URL } from "../../api";
import { isLoading } from "../../helpers";

const SET_LOADING_ASANA_TAGS = "SET_LOADING_ASANATAGS";
const SUCCESS_LOADING_ASANA_TAGS = "SUCCESS_LOADING_ASANATAGS";

const SET_LOADING_ASANA_PROJECTS = "SET_LOADING_ASANAPROJECTS";
const SUCCESS_LOADING_ASANA_PROJECTS = "SUCCESS_LOADING_ASANAPROJECTS";

const SET_LOADING_ASANA_SECTIONS = "SET_LOADING_ASANASECTIONS";
const SUCCESS_LOADING_ASANA_SECTIONS = "SUCCESS_LOADING_ASANASECTIONS";

const SET_LOADING_ASANA_TASKS = "SET_LOADING_ASANATASKS";
const SUCCESS_LOADING_ASANA_TASKS = "SUCCESS_LOADING_ASANATASKS";

const MATCH_PROJECT_KANBAN = /^(Dev|Product) Kanban Week \d\d?/u;
const MATCH_PROJECT_BACKLOG = /^Product Backlog$/u;

const getAsanaApiClient = ({ settings }) => {
  const { asanaApiKey } = settings;

  const client = Asana.Client.create().useAccessToken(asanaApiKey);
  const { gid: workspace } =
    settings.asanaDefaultWorkspace || settings.user.workspaces[0];

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

const getSections = async (getState, { gid: projectGid }) => {
  Logger.trace("Getting section list from API...", {
    projectGid
  });

  const { client } = getAsanaApiClient(getState());

  const collection = await client.sections.getSectionsForProject(projectGid);
  const sections = await collection.fetch();

  Logger.trace("Gotten sections!", { sections });

  return sections;
};

const getTasks = async (asanaClient, { gid: sectionGid, ...section }) => {
  Logger.trace("Getting project tasks from API...", { sectionGid });

  const collection = await asanaClient.tasks.getTasks({
    section: sectionGid,
    opt_fields: [
      "projects",
      "name",
      "created_at",
      "completed_at",
      "started_at",
      "custom_fields",
      "tags",
      "due_on"
    ]
  });

  const tasks = (await collection.fetch()).map(task => ({
    ...task,
    sections: [{ gid: sectionGid, ...section }]
  }));
  Logger.debug("Gotten project tasks from API!", { tasks });

  return tasks;
};

const loadTags = async (dispatch, getState) => {
  try {
    dispatch({ type: SET_LOADING_ASANA_TAGS, loading: true });

    Logger.trace("Getting tags from API...");
    const { client, workspace } = getAsanaApiClient(getState());

    const collection = await client.tags.getTags({
      workspace,
      opt_fields: ["name", "color"]
    });
    const asanaTags = await collection.fetch();
    Logger.trace("Gotten tags from API!", { asanaTags });

    dispatch({
      type: SUCCESS_LOADING_ASANA_TAGS,
      loading: false,
      value: { asanaTags },
      timestamp: new Date()
    });

    return asanaTags;
  } catch (error) {
    dispatch({ type: SET_LOADING_ASANA_TAGS, loading: false });
    Logger.error(error.callStack || error);
    return false;
  }
};

const loadProjects = async (dispatch, getState) => {
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

const loadSections = async (dispatch, getState, { asanaProjects }) => {
  try {
    dispatch({ type: SET_LOADING_ASANA_SECTIONS, loading: true });

    const asanaSections = (
      await Promise.all(
        asanaProjects.map(async project => await getSections(getState, project))
      )
    ).flat();

    dispatch({
      type: SUCCESS_LOADING_ASANA_SECTIONS,
      loading: false,
      value: { asanaSections },
      timestamp: new Date()
    });

    return asanaSections;
  } catch (error) {
    dispatch({ type: SET_LOADING_ASANA_SECTIONS, loading: false });
    Logger.error(error.callStack || error);
    return false;
  }
};

const loadTasks = async (dispatch, getState, { asanaSections }) => {
  try {
    dispatch({ type: SET_LOADING_ASANA_TASKS, loading: true });

    const { client } = getAsanaApiClient(getState());

    const { asanaTasks } = getState().asanaTasks;

    const asanaTags = await loadTags(dispatch, getState);

    const tasksCollection = collect(
      await Promise.all(asanaSections.map(section => getTasks(client, section)))
    )
      .flatten(1)
      .map(
        (
          { sections, tags, projects, custom_fields, ...task },
          index,
          tasks
        ) => ({
          ...task,
          tags: collect(tags).map(
            tag => collect(asanaTags).firstWhere("gid", tag.gid).name
          ),
          sections: collect(tasks)
            .where("gid", task.gid)
            .pluck("sections")
            .flatten(1)
            .pluck("name")
            .all(),
          projects: collect(projects)
            .pluck("gid")
            .all(),
          ...custom_fields.reduce(
            (accumulator, { name, number_value, enum_value }) => ({
              [camelcase(name)]: number_value || enum_value,
              ...accumulator
            }),
            {}
          )
        })
      )
      .unique("gid");

    const taskKeyMap = tasksCollection
      .mapWithKeys(({ gid }) => [gid, true])
      .all();
    const merged = tasksCollection.merge(
      collect(asanaTasks).filter(({ gid }) => !taskKeyMap[gid])
    );

    dispatch({
      type: SUCCESS_LOADING_ASANA_TASKS,
      loading: false,
      value: { asanaTasks: merged.all() },
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

    const asanaProjects = await loadProjects(dispatch, getState);

    const newAsanaProjects = collect(asanaProjects).filter(
      ({ gid }) => !currentAsanaProjects.contains("gid", gid)
    );

    if (!forceReload && newAsanaProjects.isEmpty()) {
      Logger.debug("No new projects found!");
      return false;
    }

    const asanaSections = await loadSections(dispatch, getState, {
      asanaProjects: forceReload ? asanaProjects : newAsanaProjects.all()
    });
    await loadTasks(dispatch, getState, {
      asanaSections
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

    const { asanaProjects } = state.asanaProjects;
    const { asanaSections } = state.asanaSections;

    const sections = collect(asanaProjects)
      .filter(({ gid }) => projects.pluck("gid").contains(gid))
      .pluck("sections")
      .flatten(1)
      .map(({ gid: sectionGid }) =>
        collect(asanaSections).firstWhere("gid", sectionGid)
      )
      .all();

    await loadTasks(dispatch, getState, {
      asanaSections: sections
    });
  };
};

export { loadAll, lookForNewProjects, reloadProject, MATCH_PROJECT_BACKLOG };
