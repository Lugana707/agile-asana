import axios from "axios";
import jsLogger from "js-logger";
import { ASANA_API_URL } from "../../../api";
import { loadProjectTasks } from "./projectTaskActions";

const SET_LOADING_ASANA_PROJECTS = "SET_LOADING_ASANAPROJECTS";
const SUCCESS_LOADING_ASANA_PROJECTS = "SUCCESS_LOADING_ASANAPROJECTS";

const MATCH_PROJECT_KANBAN = /^(Dev|Product) Kanban Week \d\d?/;

const loadProjects = () => {
  return async dispatch => {
    try {
      dispatch({ type: SET_LOADING_ASANA_PROJECTS, loading: true });

      const match = MATCH_PROJECT_KANBAN;
      const url = `${ASANA_API_URL}/projects`;
      jsLogger.debug("Getting project list from API...", { url });

      const { data } = await axios.get(url, {
        params: {
          opt_fields: [].join(",") || undefined,
          archived: true
        },
        validateStatus: status => status === 200
      });
      jsLogger.debug("Gotten projects! Filtering...", { data, match });

      const asanaProjects = data.data
        .filter(({ name }) => match.test(name))
        .map(({ name, ...project }) => ({
          name,
          week: parseInt(name.replace(/.+ Kanban Week /, "").trim(), 10),
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

export { loadProjects };
