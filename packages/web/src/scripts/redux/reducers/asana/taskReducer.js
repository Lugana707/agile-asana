import { REHYDRATE } from "redux-persist";
import collect from "collect.js";

export default () => {
  const initialState = {
    loading: false,
    ids: [],
    data: [],
    asanaTasks: [],
    timestamp: false
  };

  const uuidKey = "gid";

  const parseTask = task => collect(task).all();

  const onTasksSetHandler = ({ state, tasks }) => {
    const tasksCollection = collect(tasks).map(({ assignee, ...task }) => ({
      assignee: assignee && (assignee.gid || assignee),
      ...task
    }));

    tasksCollection.where("assignee").dump();

    const ids = tasksCollection
      .pluck(uuidKey)
      .unique()
      .sort()
      .toArray();

    const data = tasksCollection
      .unique(uuidKey)
      .map(parseTask)
      .sortBy(uuidKey)
      .toArray();

    return {
      ...state,
      loading: false,
      ids,
      data,
      asanaTasks: data,
      timestamp: new Date()
    };
  };

  return (state = initialState, { type, loading, value, payload } = {}) => {
    switch (type) {
      case REHYDRATE:
        if (!payload || !payload.asanaTasks) {
          return state;
        }

        return onTasksSetHandler({
          state,
          loading,
          tasks: payload.asanaTasks.asanaTasks || payload.asanaTasks.data
        });
      case "SET_LOADING_ASANATASKS":
        return { ...state, loading };
      case "SUCCESS_LOADING_ASANATASKS":
        return onTasksSetHandler({ state, loading, tasks: value.asanaTasks });
      case "LOGOUT":
        return initialState;
      default:
        return state;
    }
  };
};
