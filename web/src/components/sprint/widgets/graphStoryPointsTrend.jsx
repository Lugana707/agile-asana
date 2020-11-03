import React, { useMemo, useCallback } from "react";
import { Chart } from "react-charts";
import collect from "collect.js";

const GraphStoryPointsTrend = ({ sprints = [] }) => {
  const sprintsCollection = useMemo(() => collect(sprints).sortByDesc("week"), [
    sprints
  ]);

  const completedSprints = useMemo(
    () => sprintsCollection.filter(({ state }) => state === "COMPLETED"),
    [sprintsCollection]
  );

  const data = useMemo(
    () => [
      {
        label: "3 Week Average",
        data: completedSprints
          .map(obj => [obj.number, obj.averageCompletedStoryPoints])
          .reverse()
          .all()
      },
      {
        label: "Overall Trend",
        data: completedSprints
          .whereIn("number", [
            completedSprints.min("number"),
            completedSprints.max("number")
          ])
          .map(obj => [obj.number, obj.averageCompletedStoryPoints])
          .all()
      },
      {
        label: "Committed Story Points",
        data: sprintsCollection
          .map(obj => [obj.number, obj.storyPoints])
          .reverse()
          .all()
      },
      {
        label: "Completed Story Points",
        data: sprintsCollection
          .map(obj => [obj.number, obj.completedStoryPoints])
          .reverse()
          .all()
      }
    ],
    [sprintsCollection]
  );

  const series = useCallback((series, index) => {
    switch (index) {
      case 0:
      case 1:
        return { type: "line", position: "bottom" };
      case 2:
      case 3:
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
