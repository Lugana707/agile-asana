export default (
  resourceType = "",
  resourceIdKey = "",
  initialState = {
    loading: false,
    [resourceType]: false
  }
) => {
  const resourceTypeUpperCase = resourceType.toUpperCase();
  const resourceTypeSingular = resourceTypeUpperCase.slice(
    0,
    resourceTypeUpperCase.length - 1
  );

  return (state = initialState, { type, value, loading, timestamp } = {}) => {
    switch (type) {
      case `SET_LOADING_${resourceTypeUpperCase}`:
        return {
          ...state,
          loading
        };
      case `SUCCESS_LOADING_${resourceTypeUpperCase}`:
        return {
          ...state,
          loading,
          [resourceType]: [...value[resourceType]],
          timestamp
        };
      case `ADD_${resourceTypeSingular}`:
        return {
          ...state,
          loading,
          [resourceType]: state[resourceType].concat(value)
        };
      case `DELETE_${resourceTypeSingular}`:
        return {
          ...state,
          loading,
          [resourceType]: state[resourceType].filter(
            ({ [resourceIdKey]: id }) => id !== value[resourceIdKey]
          )
        };
      case "LOGOUT":
        return initialState;
      default:
        return state;
    }
  };
};
