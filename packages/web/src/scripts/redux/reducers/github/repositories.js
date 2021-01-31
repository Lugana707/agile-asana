import collect from "collect.js";

export default () => {
  const initialState = {
    loading: false,
    ids: [],
    data: [],
    error: false,
    timestamp: false
  };

  const onFoundGithubRepositories = ({ state, repositories }) => {
    const reposCollection = collect(repositories);

    const repoIdsCollection = reposCollection.pluck("id");

    const ids = repoIdsCollection
      .merge(state.ids)
      .unique()
      .sort()
      .toArray();

    const data = collect(state.data)
      .whereNotIn("id", repoIdsCollection.toArray())
      .merge(reposCollection.toArray())
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
      case "START_LOOKING_FOR_GITHUB_REPOSITORIES":
        return { ...state, loading: true };
      case "FOUND_GITHUB_REPOSITORIES":
        return onFoundGithubRepositories({ state, repositories: data });
      case "FINISHED_LOOKING_FOR_GITHUB_REPOSITORIES":
        return { ...state, loading: false };
      case "LOGOUT":
      case "LOGOUT_FROM_GITHUB":
        return initialState;
      default:
        return state;
    }
  };
};
