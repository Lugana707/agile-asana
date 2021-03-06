import axios from "axios";
import Asana from "asana";
import Logger from "js-logger";
import camelcase from "camelcase";
import collect from "collect.js";
import moment from "moment";
import { ASANA_API_URL } from "../../api";

const getAsanaApiClient = ({ settings }) => {
  const { asanaApiKey } = settings;

  const client = Asana.Client.create().useAccessToken(asanaApiKey);
  const { gid: workspace } = settings.asanaDefaultWorkspace;

  return {
    client,
    workspace
  };
};

const isLoading = state => {
  const { loading: asanaProjectsLoading } = state.asanaProjects;
  const { loading: asanaTasksLoading } = state.asanaTasks;

  return asanaProjectsLoading || asanaTasksLoading;
};

const getTasks = async (asanaClient, { gid: projectGid, name }) => {
  Logger.trace("Getting project tasks from API...", { projectGid });

  const collection = await asanaClient.tasks.getTasks({
    project: projectGid,
    //opt_expand: "."
    opt_fields: [
      "name",
      "created_at",
      "completed_at",
      "started_at",
      "custom_fields",
      "tags.(name|color)",
      "due_on",
      "notes",
      "html_notes",
      "assignee.(name|email|photo)",
      //"followers.(name|email|photo)",
      "created_by.(name|email|photo)",
      "memberships.(project.name|section.name)",
      "permalink_url",
      "parent",
      "subtasks",
      "dependencies",
      "dependents"
    ]
  });

  const tasks = await collection.fetch();
  Logger.debug("Gotten project tasks from API!", {
    project: name,
    tasks
  });

  return tasks;
};

const getProjects = async (dispatch, { asanaSettings }) => {
  try {
    dispatch({ type: "STARTED_LOADING_ASANA_PROJECTS" });

    const getProjectsFromAsana = async archived => {
      const url = `${ASANA_API_URL}/projects`;
      Logger.debug("Getting project list from API...", { url, archived });

      const { data } = await axios.get(url, {
        params: {
          opt_fields: [
            "sections.name",
            "name",
            "created_at",
            "due_on",
            "start_on",
            "permalink_url"
            //"followers.(name|email|photo)",
            //"created_by.(name|email|photo)"
          ].join(","),
          archived
        },
        validateStatus: status => status === 200
      });

      const projects = data.data.map(project => ({ ...project, archived }));
      Logger.debug("Gotten project list from API!", { projects });

      return projects;
    };

    const backlogMatch = new RegExp(asanaSettings.backlogMatch, "iu");
    const sprintMatch = new RegExp(asanaSettings.sprintMatch, "iu");

    const asanaProjects = collect(
      await Promise.all([
        await getProjectsFromAsana(true),
        await getProjectsFromAsana(false)
      ])
    )
      .flatten(1)
      .map(project => ({
        ...project,
        isBacklog: backlogMatch.test(project.name),
        isSprint: sprintMatch.test(project.name)
      }))
      .filter(({ isBacklog, isSprint }) => isBacklog || isSprint)
      .pipe(collection =>
        collection.whereNotIn(
          "gid",
          collection
            .where("isSprint", true)
            .sortDesc(({ created_at }) => moment(created_at).unix())
            .skip(20)
            .pluck("gid")
            .toArray()
        )
      )
      .toArray();

    return asanaProjects;
  } catch (error) {
    Logger.error(error.callStack || error);

    return false;
  } finally {
    dispatch({ type: "FINISHED_LOADING_ASANA_PROJECTS" });
  }
};

const loadProjectTasks = async (dispatch, getState, { asanaProjects }) => {
  try {
    dispatch({ type: "STARTED_LOADING_ASANA_TASKS" });

    const { client } = getAsanaApiClient(getState());

    await Promise.all(
      asanaProjects.map(async project => {
        const tasks = collect(await getTasks(client, project)).map(
          ({ custom_fields, ...task }) => ({
            ...task,
            custom_fields: custom_fields.filter(obj => !!obj.enum_value),
            ...custom_fields
              .filter(obj => !!obj.number_value)
              .reduce(
                (accumulator, { name, number_value }) => ({
                  [camelcase(name)]: number_value,
                  ...accumulator
                }),
                {}
              )
          })
        );

        dispatch({
          type: "ASANA_PROJECT_ADDED",
          project,
          tasks,
          loading: true
        });
      })
    );
  } catch (error) {
    Logger.error(error.callStack || error);
  } finally {
    dispatch({ type: "FINISHED_LOADING_ASANA_TASKS" });
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

    const currentAsanaProjects = collect(state.asanaProjects.data);

    const asanaProjects = await getProjects(dispatch, state);

    const newAsanaProjects = collect(asanaProjects).filter(
      ({ gid }) => !currentAsanaProjects.contains("gid", gid)
    );

    if (!forceReload && newAsanaProjects.isEmpty()) {
      Logger.debug("No new projects found!");
      return false;
    }

    await loadProjectTasks(dispatch, getState, {
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

    await loadProjectTasks(dispatch, getState, {
      asanaProjects: projects
    });
  };
};

const reloadRecentProjects = ({ numberOfProjects = 2 } = {}) => {
  return (dispatch, getState) => {
    const { data: asanaProjects } = getState().asanaProjects;

    dispatch(
      reloadProject({
        projects: collect(asanaProjects)
          .sortByDesc(({ created_at }) => moment(created_at).unix())
          .where("isSprint", true)
          .take(numberOfProjects)
          .merge(
            collect(asanaProjects)
              .where("isBacklog", true)
              .toArray()
          )
          .unique("gid")
          .where()
      })
    );
    dispatch(lookForNewProjects());
  };
};

export { loadAll, lookForNewProjects, reloadProject, reloadRecentProjects };
