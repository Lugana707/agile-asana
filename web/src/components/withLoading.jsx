import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { isLoading } from "../scripts/helpers";

export default WrappedComponent => props => {
  const { globalReducer, ...state } = useSelector(state => state);

  const { loading: globalLoading } = globalReducer;

  const loading = useMemo(() => globalLoading || isLoading(state), [
    globalLoading,
    state
  ]);

  return <WrappedComponent {...props} loading={loading} />;
};
