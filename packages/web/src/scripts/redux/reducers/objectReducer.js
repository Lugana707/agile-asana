export default (
  resourceType = "",
  initialState = {
    loading: false
  }
) => {
  const resourceTypeUpperCase = resourceType.toUpperCase();

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
          ...value,
          loading,
          timestamp
        };
      case `ADD_${resourceTypeUpperCase}`:
        return {
          ...state,
          ...value,
          loading
        };
      case `DELETE_${resourceTypeUpperCase}`:
        return {
          ...state,
          loading,
          [value]: undefined
        };
      case "LOGOUT":
        return initialState;
      default:
        return state;
    }
  };
};
