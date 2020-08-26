import axios from "axios";
import jsLogger from "js-logger";
import moment from "moment";
import { ASANA_API_URL } from "../../../api";
import { loadProjectTasks } from "./projectTaskActions";

const SET_LOADING_RAW_PROJECTS = "SET_LOADING_RAWPROJECTS";
const SUCCESS_LOADING_RAW_PROJECTS = "SUCCESS_LOADING_RAWPROJECTS";

const SET_LOADING_ASANA_PROJECTS = "SET_LOADING_ASANAPROJECTS";
const SUCCESS_LOADING_ASANA_PROJECTS = "SUCCESS_LOADING_ASANAPROJECTS";

const MATCH_PROJECT_KANBAN = /^(Dev|Product) Kanban Week \d\d?/u;
const MATCH_PROJECT_BACKLOG = /^Product Backlog$/u;

const processProjects = ({ rawProjects }) => {
  return async dispatch => {
    try {
      dispatch({ type: SET_LOADING_ASANA_PROJECTS, loading: true });

      const matchKanban = MATCH_PROJECT_KANBAN;
      const matchBacklog = MATCH_PROJECT_BACKLOG;

      jsLogger.debug("Gotten projects! Filtering...", {
        rawProjects,
        matchKanban,
        matchBacklog
      });

      const asanaProjects = rawProjects
        .filter(({ name }) => matchKanban.test(name))
        .map(({ name, start_on, due_on, created_at, ...project }) => {
          const startOn = moment(start_on || created_at);
          const createdAt = moment(created_at);
          const dueOn = moment(due_on);

          const week = parseInt(
            name.replace(/.+ Kanban Week /u, "").trim(),
            10
          );

          const sprintLength = dueOn.diff(startOn.format("YYYY-MM-DD"), "days");

          return {
            name,
            week,
            startOn,
            createdAt,
            dueOn,
            sprintLength,
            ...project
          };
        });
      asanaProjects.sort((a, b) => (a.week < b.week ? 1 : -1));

      const [asanaBacklog] = rawProjects.filter(({ name }) =>
        matchBacklog.test(name)
      );

      jsLogger.debug("Filtered projects!", { asanaProjects, asanaBacklog });

      dispatch({
        type: SUCCESS_LOADING_ASANA_PROJECTS,
        loading: false,
        value: { asanaProjects },
        timestamp: new Date()
      });
      dispatch(loadProjectTasks({ asanaProjects, asanaBacklog }));
    } catch (error) {
      dispatch({ type: SET_LOADING_ASANA_PROJECTS, loading: false });
      jsLogger.error(error.callStack || error);
    }
  };
};

const loadProjects = () => {
  return async dispatch => {
    try {
      dispatch({ type: SET_LOADING_RAW_PROJECTS, loading: true });

      const getSections = async ({ gid }) => {
        const url = `${ASANA_API_URL}/projects/${gid}/sections`;
        jsLogger.trace("Getting section list from API...", {
          url,
          projectGid: gid
        });

        const { data } = await axios.get(url, {
          params: {
            opt_fields: [].join(",") || undefined
          },
          validateStatus: status => status === 200
        });

        jsLogger.trace("Gotten sections!", { data });

        return data.data;
      };

      const getProjects = async archived => {
        const url = `${ASANA_API_URL}/projects`;
        jsLogger.debug("Getting project list from API...", { url, archived });

        const { data } = await axios.get(url, {
          params: {
            opt_fields: [
              "sections",
              "name",
              "created_at",
              "due_on",
              "start_on"
            ].join(","),
            archived
          },
          validateStatus: status => status === 200
        });

        const matchKanban = MATCH_PROJECT_KANBAN;
        const matchBacklog = MATCH_PROJECT_BACKLOG;

        return Promise.all(
          data.data
            .map(project => ({ ...project, archived }))
            .filter(
              ({ name }) => matchKanban.test(name) || matchBacklog.test(name)
            )
            .map(async project => ({
              ...project,
              sections: await getSections(project)
            }))
        );
      };

      const rawProjects = []
        .concat(await getProjects(true))
        .concat(await getProjects(false));
      jsLogger.debug("Gotten project list from API!", { rawProjects });

      dispatch({
        type: SUCCESS_LOADING_RAW_PROJECTS,
        loading: false,
        value: { rawProjects },
        timestamp: new Date()
      });
      dispatch(processProjects({ rawProjects }));
    } catch (error) {
      dispatch({ type: SET_LOADING_RAW_PROJECTS, loading: false });
      jsLogger.error(error.callStack || error);
    }
  };
};

export { loadProjects };
