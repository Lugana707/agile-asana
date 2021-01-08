import React, { useMemo } from "react";
import withSprints from "./withSprints";

export default WrappedComponent =>
  withSprints(({ match, sprints, ...props }) => {
    const { uuid } = match.params;

    const sprint = useMemo(
      () =>
        sprints.firstWhere("uuid", uuid) ||
        sprints.firstWhere("number", parseInt(uuid, 10)),
      [uuid, sprints]
    );

    return <WrappedComponent {...props} sprint={sprint} />;
  });
