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

  const parseTask = ({ assignee, subtasks, custom_fields, ...task }) => ({
    ...task,
    custom_fields: (custom_fields || []).map(({ name, enum_value }) => ({
      name,
      enum_value: collect(enum_value)
        .only(["name", "color"])
        .all()
    })),
    assignee: assignee && (assignee.gid || assignee),
    subtasks: collect(subtasks)
      .map(subtask => subtask.gid || subtask)
      .toArray(),
    ...task
  });

  const onTasksAddedHandler = ({ state, tasks }) => {
    const tasksCollection = collect(tasks).map(parseTask);

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
