import React, { useMemo, useCallback } from "react";
import { Chart } from "react-charts";
import { useSelector } from "react-redux";

const GraphStoryPointsTrend = () => {
  const { loading, asanaProjectTasks = [] } = useSelector(
    state => state.asanaProjectTasks
  );

  const projectTasks = asanaProjectTasks || [];

  const data = useMemo(
    () => [
      {
        label: "3 Week Average",
        data: projectTasks
          .map(obj => [obj.week, obj.runningAverageCompletedStoryPoints])
          .reverse()
      },
      {
        label: "Committed Story Points",
        data: projectTasks
          .map(obj => [obj.week, obj.committedStoryPoints])
          .reverse()
      },
      {
        label: "Completed Story Points",
        data: projectTasks
          .map(obj => [obj.week, obj.completedStoryPoints])
          .reverse()
      }
    ],
    [projectTasks]
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

  if (loading) {
    return <div className="loading-spinner centre" />;
  }

  return <Chart data={data} series={series} axes={axes} tooltip dark />;
};

export default GraphStoryPointsTrend;
