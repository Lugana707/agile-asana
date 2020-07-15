import React, { useMemo, useCallback } from "react";
import { Chart } from "react-charts";

const GraphStoryPointsTrend = ({ sprints }) => {
  const data = useMemo(
    () => [
      {
        label: "3 Week Average",
        data: sprints
          .map(obj => [obj.week, obj.runningAverageCompletedStoryPoints])
          .reverse()
      },
      {
        label: "Committed Story Points",
        data: sprints.map(obj => [obj.week, obj.committedStoryPoints]).reverse()
      },
      {
        label: "Completed Story Points",
        data: sprints.map(obj => [obj.week, obj.completedStoryPoints]).reverse()
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
      { position: "left", type: "linear", stacked: false }
    ],
    []
  );

  return <Chart data={data} series={series} axes={axes} tooltip dark />;
};

export default GraphStoryPointsTrend;
