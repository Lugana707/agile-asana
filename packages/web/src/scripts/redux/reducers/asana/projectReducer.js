import { REHYDRATE } from "redux-persist";
import collect from "collect.js";

export default () => {
  const initialState = {
    loading: false,
    ids: [],
    data: [],
    timestamp: false
  };

  const uuidKey = "gid";

  const parseTask = task => collect(task).all();

  const onProjectsSetHandler = ({ state, projects }) => {
    const projectsCollection = collect(projects);

    const ids = projectsCollection
      .pluck(uuidKey)
      .unique()
      .sort()
      .toArray();

    const data = projectsCollection
      .unique(uuidKey)
      .map(parseTask)
      .sortBy(uuidKey)
      .toArray();

    return {
      ...state,
      loading: false,
      ids,
      data,
      timestamp: new Date()
    };
  };

  return (state = initialState, { type, loading, data, payload } = {}) => {
    switch (type) {
      case REHYDRATE:
        if (!payload || !payload.asanaProjects) {
          return state;
        }

        const { asanaProjects } = payload;

        return onProjectsSetHandler({
          state,
          loading: false,
          projects: asanaProjects.data || asanaProjects.asanaProjects
        });
      case "SET_LOADING_ASANAPROJECTS":
        return { ...state, loading };
      case "SUCCESS_LOADING_ASANAPROJECTS":
        return onProjectsSetHandler({ state, projects: data });
      case "LOGOUT":
        return initialState;
      default:
        return state;
    }
  };
};
