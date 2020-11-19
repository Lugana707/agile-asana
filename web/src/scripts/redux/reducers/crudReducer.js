/* jshint maxcomplexity:7 */
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

  const upsertFromArray = (collection, value) => [
    ...collection.filter(
      ({ [resourceIdKey]: id }) => id !== value[resourceIdKey]
    ),
    value
  ];

  const deleteFromArray = (collection, value) =>
    collection.filter(({ [resourceIdKey]: id }) => id !== value[resourceIdKey]);

  return (state = initialState, { type, value, loading, timestamp } = {}) => {
    const { [resourceType]: collection } = value;

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
          [resourceType]: [...collection, value]
        };
      case `UPSERT_${resourceTypeSingular}`:
        return {
          ...state,
          loading,
          [resourceType]: upsertFromArray(collection, value)
        };
      case `DELETE_${resourceTypeSingular}`:
        return {
          ...state,
          loading,
          [resourceType]: deleteFromArray(collection)
        };
      case "LOGOUT":
        return initialState;
      default:
        return state;
    }
  };
};
