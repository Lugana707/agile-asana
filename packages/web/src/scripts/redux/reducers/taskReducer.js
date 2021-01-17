import collect from "collect.js";

export default () => {
  const initialState = {
    loading: false,
    ids: [],
    data: []
  };

  const uuidKey = "uuid";

  const onTasksAddedHandler = ({ state, tasks }) => {
    const taskIdsCollection = collect(tasks).pluck(uuidKey);

    const ids = taskIdsCollection
      .merge(state.ids)
      .unique()
      .sort()
      .toArray();

    const data = collect(state.data)
      .whereNotIn(uuidKey, taskIdsCollection.toArray())
      .merge(tasks)
      .unique(uuidKey)
      .sortBy(uuidKey)
      .toArray();

    return { ...state, ids, data };
  };

  return (state = initialState, { type, tasks } = {}) => {
    switch (type) {
      case "SPRINT_ADDED":
      case "BACKLOG_ADDED":
      case "SUCCESS_LOADING_BACKLOGTASKS":
        return onTasksAddedHandler({ state, tasks });
      case "LOGOUT":
        return initialState;
      default:
        return state;
    }
  };
};
