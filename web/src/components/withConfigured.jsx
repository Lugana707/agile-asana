import React, { useMemo } from "react";
import { useSelector } from "react-redux";

export default WrappedComponent => props => {
  const { asanaApiKey } = useSelector(state => state.settings);

  const asanaConfigured = useMemo(() => !!asanaApiKey, [asanaApiKey]);
  const configured = useMemo(() => !!asanaConfigured, [asanaConfigured]);

  return (
    <WrappedComponent
      {...props}
      asanaConfigured={asanaConfigured}
      configured={configured}
    />
  );
};
