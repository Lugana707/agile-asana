import React, { useMemo } from "react";
import { Chart } from "react-charts";
import { useSelector } from "react-redux";

const GraphStoryPoints = () => {
  const { loading, asanaProjectTasks = [] } = useSelector(
    state => state.asanaProjectTasks
  );

  const data = useMemo(
    () => [
      {
        label: "Completed Story Points",
        data: asanaProjectTasks
          .map(obj => [obj.week, obj.completedStoryPoints])
          .reverse()
      },
      {
        label: "Completed Story Points",
        data: asanaProjectTasks
          .map(obj => [obj.week, obj.committedStoryPoints])
          .reverse()
      }
    ],
    [asanaProjectTasks]
  );

  const series = useMemo(() => ({ type: "bar", position: "bottom" }), []);
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

export default GraphStoryPoints;
