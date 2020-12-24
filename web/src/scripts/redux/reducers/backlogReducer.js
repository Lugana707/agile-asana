import collect from "collect.js";

export default () => {
  const initialState = {
    loading: false,
    ids: [],
    data: []
  };

  const onBacklogAddedHandler = ({ state, backlog }) => {
    const { uuid } = backlog;

    const taskIdsCollection = collect(state.ids);

    const ids = taskIdsCollection
      .merge([uuid])
      .unique()
      .sort()
      .toArray();

    const data = collect(state.data)
      .where("uuid", "!==", uuid)
      .merge([backlog])
      .sortBy("uuid")
      .toArray();

    return { ...state, ids, data };
  };

  return (state = initialState, { type, backlog }) => {
    switch (type) {
      case "BEGIN_LOADING_BACKLOGS":
        return { ...state, loading: true };
      case "FINISH_LOADING_BACKLOGS":
        return { ...state, loading: false };
      case "BACKLOG_ADDED":
        return onBacklogAddedHandler({ state, backlog });
      case "LOGOUT":
        return initialState;
      default:
        return state;
    }
  };
};
