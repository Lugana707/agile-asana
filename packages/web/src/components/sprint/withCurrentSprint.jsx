import React, { useMemo } from "react";
import withSprints from "./withSprints";

export default WrappedComponent =>
  withSprints(({ sprints, ...props }) => {
    const currentSprint = useMemo(() => sprints.firstWhere("state", "ACTIVE"), [
      sprints
    ]);

    return (
      <WrappedComponent
        {...props}
        sprints={sprints}
        currentSprint={currentSprint}
      />
    );
  });
