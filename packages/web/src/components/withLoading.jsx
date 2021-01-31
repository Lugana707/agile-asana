import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import collect from "collect.js";

export default WrappedComponent => props => {
  const state = useSelector(state => state);

  const loading = useMemo(
    () =>
      collect(state)
        .map(({ loading }) => loading)
        .firstWhere(true),
    [state]
  );

  return <WrappedComponent {...props} loading={loading} />;
};
