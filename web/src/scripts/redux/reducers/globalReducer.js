const initialState = {
  loading: false
};

const globalReducer = (state = initialState, { type, loading } = {}) => {
  if (loading === true || loading === false) {
    return {
      ...state,
      loading
    };
  }

  return state;
};

export default globalReducer;
