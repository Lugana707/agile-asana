import React, { useMemo } from "react";
import withSprints from "./withSprints";

export default WrappedComponent =>
  withSprints(({ sprints, match, ...props }) => {
    const { uuid } = match.params;

    const sprint = useMemo(() => sprints.firstWhere("uuid", uuid), [
      uuid,
      sprints
    ]);

    return <WrappedComponent {...props} sprint={sprint} />;
  });
