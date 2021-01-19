import React, { useMemo } from "react";
import withSprints from "./withSprints";

export default WrappedComponent =>
  withSprints(({ sprints, ...props }) => {
    const currentSprint = useMemo(
      () => sprints.firstWhere("isCurrentSprint", true),
      [sprints]
    );

    return <WrappedComponent {...props} currentSprint={currentSprint} />;
  });
