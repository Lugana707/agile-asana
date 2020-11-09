import React, { useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import { Chart } from "react-charts";
import moment from "moment";
import collect from "collect.js";

const GraphCountOverTime = () => {
  const { refinedBacklogTasks } = useSelector(
    state => state.refinedBacklogTasks
  );
  const { unrefinedBacklogTasks } = useSelector(
    state => state.unrefinedBacklogTasks
  );

  const backlogCountPerDay = useMemo(
    () =>
      collect(refinedBacklogTasks)
        .merge(unrefinedBacklogTasks)
        .pluck("createdAt")
        .where()
        .map(date => moment(date.format("YYYY-MM-DD")))
        .countBy()
        .map((obj, key) => ({ date: key, count: obj }))
        .reduce(
          (accumualator, currentValue) => accumualator.push(currentValue),
          collect()
        ),
    [refinedBacklogTasks, unrefinedBacklogTasks]
  );

  const data = useMemo(
    () => [
      {
        label: "Backlog items added",
        data: backlogCountPerDay.map(({ date, count }) => [date, count]).all()
      }
    ],
    [backlogCountPerDay]
  );

  const series = useCallback((series, index) => {
    return { type: "bar" };
  }, []);

  const axes = useMemo(
    () => [
      {
        primary: true,
        type: "ordinal",
        position: "bottom",
        format: (d, index) => index % 10 === 0 && moment(d).format("YYYY-MM-DD")
      },
      {
        position: "left",
        type: "linear",
        stacked: false
      }
    ],
    []
  );

  return <Chart data={data} series={series} axes={axes} tooltip dark />;
};

export default GraphCountOverTime;
