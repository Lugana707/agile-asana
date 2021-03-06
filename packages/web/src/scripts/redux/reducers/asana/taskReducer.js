/* jshint maxcomplexity:11 */

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
    const data = collect(state.data)
      .whereNotIn(uuidKey, tasks.pluck(uuidKey).toArray())
      .merge(tasks.map(parseTask).toArray())
      .unique(uuidKey)
      .sortBy(uuidKey);

    return {
      ...state,
      ids: data.pluck(uuidKey).toArray(),
      data: data.toArray(),
      timestamp: new Date()
    };
  };

  return (state = initialState, { type, loading, tasks, payload } = {}) => {
    switch (type) {
      case REHYDRATE:
        if (!payload || !payload.asanaTasks) {
          return state;
        }

        const { asanaTasks } = payload;

        return onTasksAddedHandler({
          state,
          loading: false,
          tasks: collect(asanaTasks.data || asanaTasks.asanaTasks || [])
        });
      case "SET_LOADING_ASANATASKS":
        return { ...state, loading };
      case "STARTED_LOADING_ASANA_TASKS":
        return { ...state, loading: true };
      case "ASANA_PROJECT_ADDED":
        return onTasksAddedHandler({ state, tasks });
      case "FINISHED_LOADING_ASANA_TASKS":
        return { ...state, loading: false };
      case "LOGOUT":
        return initialState;
      default:
        return state;
    }
  };
};
