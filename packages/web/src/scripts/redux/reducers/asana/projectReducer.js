/* jshint maxcomplexity:8 */

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

  const onProjectsAddedHandler = ({ state, projects }) => {
    const projectIdsCollection = collect(projects).pluck(uuidKey);

    const ids = projectIdsCollection
      .merge(state.ids)
      .unique()
      .sort()
      .toArray();

    const data = collect(state.data)
      .whereNotIn(uuidKey, projectIdsCollection.toArray())
      .merge(projects)
      .unique(uuidKey)
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

        return onProjectsAddedHandler({
          state,
          loading: false,
          projects: asanaProjects.data || asanaProjects.asanaProjects
        });
      case "SET_LOADING_ASANAPROJECTS":
        return { ...state, loading };
      case "SUCCESS_LOADING_ASANAPROJECTS":
        return onProjectsAddedHandler({ state, projects: data });
      case "LOGOUT":
        return initialState;
      default:
        return state;
    }
  };
};
