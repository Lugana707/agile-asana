import React, { useMemo, useCallback } from "react";
import { Chart } from "react-charts";
import collect from "collect.js";

const GraphStoryPointsTrend = ({ sprints = [] }) => {
  const sprintsCollection = collect(sprints);

  const data = useMemo(
    () => [
      {
        label: "3 Week Average",
        data: sprintsCollection
          .filter(({ state }) => state === "COMPLETED")
          .map(obj => [obj.number, obj.averageCompletedStoryPoints])
          .reverse()
          .all()
      },
      {
        label: "Committed Story Points",
        data: sprintsCollection
          .map(obj => [obj.number, obj.committedStoryPoints])
          .reverse()
          .all()
      },
      {
        label: "Completed Story Points",
        data: sprintsCollection
          .map(obj => [obj.number, obj.storyPoints])
          .reverse()
          .all()
      }
    ],
    [sprints]
  );

  const series = useCallback((series, index) => {
    switch (index) {
      case 0:
        return { type: "line", position: "bottom" };
      case 1:
      case 2:
      default:
        return { type: "bar", position: "bottom" };
    }
  }, []);
  const axes = useMemo(
    () => [
      { primary: true, type: "ordinal", position: "bottom" },
      { position: "left", type: "linear", stacked: false, hardMin: 0 }
    ],
    []
  );

  return <Chart data={data} series={series} axes={axes} tooltip dark />;
};

export default GraphStoryPointsTrend;
