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
    const assigneeCollection = collect(tasks)
      .pluck("assignee")
      .where()
      .map(({ gid, ...user }) => ({
        [uuidKey]: gid || user[uuidKey],
        ...user
      }))
      .unique(uuidKey)
      .sortBy(uuidKey);

    const ids = assigneeCollection.pluck(uuidKey).toArray();

    const data = assigneeCollection.map(parseUser).toArray();

    return { ...state, ids, data };
  };

  return (state = initialState, { type, data, payload } = {}) => {
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
      case "SUCCESS_LOADING_ASANATASKS":
        return onTasksSetHandler({ state, tasks: data });
      case "LOGOUT":
        return initialState;
      default:
        return state;
    }
  };
};
