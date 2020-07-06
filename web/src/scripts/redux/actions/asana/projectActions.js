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

const processProjects = ({ rawProjects }) => {
  return async dispatch => {
    try {
      dispatch({ type: SET_LOADING_ASANA_PROJECTS, loading: true });

      const match = MATCH_PROJECT_KANBAN;

      jsLogger.debug("Gotten projects! Filtering...", {
        rawProjects,
        match
      });
      const asanaProjects = rawProjects
        .filter(({ name }) => match.test(name))
        .map(({ name, ...project }) => ({
          name,
          week: parseInt(name.replace(/.+ Kanban Week /u, "").trim(), 10),
          ...project
        }));
      asanaProjects.sort((a, b) => (a.week < b.week ? 1 : -1));

      dispatch({
        type: SUCCESS_LOADING_ASANA_PROJECTS,
        loading: false,
        value: { asanaProjects },
        timestamp: new Date()
      });
      dispatch(loadProjectTasks({ asanaProjects }));
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
              archivedFlag
            },
            validateStatus: status => status === 200
          });
          return data.data.map(obj => ({ ...obj, archivedFlag }));
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
