import React, { useMemo } from "react";
import randomFlatColors from "random-flat-colors";

export default WrappedComponent => props => {
  const colours = useMemo(
    () => ({
      committedStoryPoints: randomFlatColors("orange"),
      completedStoryPoints: randomFlatColors("yellow"),
      idealTrend: randomFlatColors("red"),
      actualTrend: randomFlatColors("blue")
    }),
    []
  );

  return <WrappedComponent {...props} colours={colours} />;
};
