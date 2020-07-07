import axios from "axios";
import jsLogger from "js-logger";
import async from "async";
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
        matchKanban
      });
      const asanaProjects = rawProjects
        .filter(({ name }) => matchKanban.test(name))
        .map(({ name, ...project }) => ({
          name,
          week: parseInt(name.replace(/.+ Kanban Week /u, "").trim(), 10),
          ...project
        }));
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

      const url = `${ASANA_API_URL}/projects`;
      jsLogger.debug("Getting project list from API...", { url });

      const [archived, unarchived] = await async.mapLimit(
        [true, false],
        2,
        async archivedFlag => {
          const { data } = await axios.get(url, {
            params: {
              opt_fields: [""].join(",") || undefined,
              archived: archivedFlag
            },
            validateStatus: status => status === 200
          });
          return data.data.map(obj => ({ ...obj, archived: archivedFlag }));
        }
      );

      const rawProjects = archived.concat(unarchived);

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
