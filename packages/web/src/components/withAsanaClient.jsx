import React, { useMemo } from "react";
import Asana from "asana";
import { useSelector } from "react-redux";

export default WrappedComponent => props => {
  const { asanaApiKey } = useSelector(state => state.settings);

  const client = useMemo(
    () => Asana.Client.create().useAccessToken(asanaApiKey),
    [asanaApiKey]
  );

  return <WrappedComponent {...props} asanaClient={client} />;
};
