import collect from "collect.js";

export default () => {
  const initialState = {
    loading: false,
    ids: [],
    data: [],
    error: false,
    timestamp: false
  };

  const onFoundGithubOrganisations = ({ state, organisations }) => {
    const orgsCollection = collect(organisations);

    const orgIdsCollection = orgsCollection.pluck("id");

    const ids = orgIdsCollection
      .merge(state.ids)
      .unique()
      .sort()
      .toArray();

    const data = collect(state.data)
      .whereNotIn("id", orgIdsCollection.toArray())
      .merge(orgsCollection.toArray())
      .unique("id")
      .sortBy("id")
      .toArray();

    return {
      ...state,
      ids,
      data,
      timestamp: new Date()
    };
  };

  return (state = initialState, { type, data } = {}) => {
    switch (type) {
      case "START_LOOKING_FOR_GITHUB_ORGANISATIONS":
        return { ...state, loading: true };
      case "FOUND_GITHUB_ORGANISATIONS":
        return onFoundGithubOrganisations({ state, organisations: data });
      case "FINISHED_LOOKING_FOR_GITHUB_ORGANISATIONS":
        return { ...state, loading: false };
      case "LOGOUT":
      case "LOGOUT_FROM_GITHUB":
        return initialState;
      default:
        return state;
    }
  };
};
