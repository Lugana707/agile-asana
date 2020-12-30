import React, { useMemo } from "react";
import withSprints from "./withSprints";

export default WrappedComponent =>
  withSprints(({ match, sprints, ...props }) => {
    const { uuid } = match.params;

    const sprint = useMemo(() => sprints.firstWhere("uuid", uuid), [
      uuid,
      sprints
    ]);

    return (
      <WrappedComponent
        {...props}
        match={match}
        sprints={sprints}
        sprint={sprint}
      />
    );
  });
