import React, { useMemo } from "react";
import { useSelector } from "react-redux";

export default WrappedComponent => props => {
  const { asanaApiKey, asanaDefaultWorkspace, github } = useSelector(
    state => state.settings
  );

  const asanaConfigured = useMemo(
    () => !!asanaApiKey && !!asanaDefaultWorkspace,
    [asanaApiKey, asanaDefaultWorkspace]
  );

  const githubConfigured = useMemo(
    () =>
      !!github &&
      !!github.pat &&
      !!github.defaultOrganisation &&
      !!github.defaultRepository,
    [github]
  );

  const configured = useMemo(() => !!asanaConfigured, [asanaConfigured]);

  return (
    <WrappedComponent
      {...props}
      asanaConfigured={asanaConfigured}
      githubConfigured={githubConfigured}
      configured={configured}
    />
  );
};
