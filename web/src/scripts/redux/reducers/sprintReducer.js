import collect from "collect.js";

export default () => {
  const initialState = {
    loading: false,
    ids: [],
    data: []
  };

  const onSprintAddedHandler = ({ state, sprint }) => {
    const { number } = sprint;

    const taskIdsCollection = collect(state.ids);

    const ids = taskIdsCollection
      .merge([number])
      .unique()
      .sort()
      .toArray();

    const data = collect(state.data)
      .where("number", "!==", number)
      .merge([sprint])
      .sortBy("number")
      .toArray();

    return { ...state, ids, data };
  };

  return (state = initialState, { type, sprint }) => {
    switch (type) {
      case "BEGIN_LOADING_SPRINTS":
        return { ...state, loading: true };
      case "FINISH_LOADING_SPRINTS":
        return { ...state, loading: false };
      case "SPRINT_ADDED":
        return onSprintAddedHandler({ state, sprint });
      case "LOGOUT":
        return initialState;
      default:
        return state;
    }
  };
};
