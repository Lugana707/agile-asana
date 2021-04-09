/* jshint maxcomplexity:10 */

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
    const projectCollection = collect(projects).where("name", true);

    const data = collect(state.data)
      .whereNotIn(uuidKey, projectCollection.pluck(uuidKey).toArray())
      .merge(projectCollection.toArray())
      .unique(uuidKey)
      .sortBy(uuidKey);

    return {
      ...state,
      ids: data.pluck(uuidKey).toArray(),
      data: data.toArray(),
      timestamp: new Date()
    };
  };

  return (
    state = initialState,
    { type, loading, project, tasks, payload } = {}
  ) => {
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
      case "STARTED_LOADING_ASANA_PROJECTS":
        return { ...state, loading: true };
      case "ASANA_PROJECT_ADDED":
        return onProjectsAddedHandler({
          state,
          projects: [{ ...project, tasks: tasks.pluck("gid").toArray() }]
        });
      case "FINISHED_LOADING_ASANA_PROJECTS":
        return { ...state, loading: false };
      case "LOGOUT":
        return initialState;
      default:
        return state;
    }
  };
};
