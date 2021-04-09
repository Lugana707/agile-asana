import { REHYDRATE } from "redux-persist";
import collect from "collect.js";

export default () => {
  const initialState = {
    ids: [],
    data: []
  };

  const uuidKey = "uuid";

  const parseUser = user =>
    collect(user)
      .except(["email"])
      .all();

  const onTasksSetHandler = ({ state, tasks }) => {
    const assigneeCollection = tasks
      .pluck("assignee")
      .where()
      .map(({ gid, ...user }) => ({
        [uuidKey]: gid || user[uuidKey],
        ...user
      }))
      .unique(uuidKey)
      .sortBy(uuidKey);

    const data = collect(state.data)
      .whereNotIn(uuidKey, assigneeCollection.pluck(uuidKey).toArray())
      .merge(assigneeCollection.map(parseUser).toArray())
      .unique(uuidKey);

    return {
      ...state,
      ids: data.pluck(uuidKey).toArray(),
      data: data.toArray(),
      timestamp: new Date()
    };
  };

  return (state = initialState, { type, tasks, payload } = {}) => {
    switch (type) {
      case REHYDRATE:
        if (!payload || !payload.users) {
          return state;
        }

        return {
          ...state,
          ...payload.users,
          ids: collect(payload.users.data)
            .pluck(uuidKey)
            .toArray()
        };
      case "ASANA_PROJECT_ADDED":
        return onTasksSetHandler({ state, tasks });
      case "LOGOUT":
        return initialState;
      default:
        return state;
    }
  };
};
