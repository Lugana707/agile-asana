const initialState = {
  loading: false
};

const globalReducer = (state = initialState, { type, loading } = {}) => {
  if (type.startsWith("SET_LOADING_")) {
    return {
      ...state,
      loading
    };
  }
  return initialState;
};

export default globalReducer;
