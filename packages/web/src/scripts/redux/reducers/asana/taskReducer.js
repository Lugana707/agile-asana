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

  const onTasksSetHandler = ({ state, tasks }) => {
    const tasksCollection = collect(tasks).map(({ assignee, ...task }) => ({
      assignee: assignee && (assignee.gid || assignee),
      ...task
    }));

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
      timestamp: new Date()
    };
  };

  return (state = initialState, { type, loading, data, payload } = {}) => {
    switch (type) {
      case REHYDRATE:
        if (!payload || !payload.asanaTasks) {
          return state;
        }

        const { asanaTasks } = payload;

        return onTasksSetHandler({
          state,
          loading,
          tasks: asanaTasks.data || asanaTasks.asanaTasks
        });
      case "SET_LOADING_ASANATASKS":
        return { ...state, loading };
      case "SUCCESS_LOADING_ASANATASKS":
        return onTasksSetHandler({ state, tasks: data });
      case "LOGOUT":
        return initialState;
      default:
        return state;
    }
  };
};
