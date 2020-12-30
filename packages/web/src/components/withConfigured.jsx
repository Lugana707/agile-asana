import React, { useMemo } from "react";
import { useSelector } from "react-redux";

export default WrappedComponent => props => {
  const { asanaApiKey, asanaDefaultWorkspace } = useSelector(
    state => state.settings
  );

  const asanaConfigured = useMemo(
    () => !!asanaApiKey && !!asanaDefaultWorkspace,
    [asanaApiKey, asanaDefaultWorkspace]
  );
  const configured = useMemo(() => !!asanaConfigured, [asanaConfigured]);

  return (
    <WrappedComponent
      {...props}
      asanaConfigured={asanaConfigured}
      configured={configured}
    />
  );
};
