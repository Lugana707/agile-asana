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

  const onTasksAddedHandler = ({ state, tasks }) => {
    const tasksCollection = collect(tasks).map(({ assignee, ...task }) => ({
      assignee: assignee && (assignee.gid || assignee),
      ...task
    }));

    const taskIdsCollection = tasksCollection.pluck(uuidKey);

    const ids = taskIdsCollection
      .merge(state.ids)
      .unique()
      .sort()
      .toArray();

    const data = collect(state.data)
      .whereNotIn(uuidKey, taskIdsCollection.toArray())
      .merge(tasksCollection.toArray())
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
        if (!payload || !payload.asanaTasks) {
          return state;
        }

        const { asanaTasks } = payload;

        return onTasksAddedHandler({
          state,
          loading: false,
          tasks: asanaTasks.data || asanaTasks.asanaTasks
        });
      case "SET_LOADING_ASANATASKS":
        return { ...state, loading };
      case "SUCCESS_LOADING_ASANATASKS":
        return onTasksAddedHandler({ state, tasks: data });
      case "LOGOUT":
        return initialState;
      default:
        return state;
    }
  };
};
