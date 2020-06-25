import React, { useMemo, useCallback } from "react";
import { Chart } from "react-charts";
import { useSelector } from "react-redux";
import moment from "moment";

const GraphStoryPointsThroughWeek = () => {
  const { loading, asanaProjectTasks = [] } = useSelector(
    state => state.asanaProjectTasks
  );

  const fullWeek = moment.weekdays().map(weekDay => [weekDay, 0]);
  const data = useMemo(
    () =>
      asanaProjectTasks.map(obj => ({
        label: `Week ${obj.week}`,
        data: obj.completedTasks
          .filter(obj => obj.completed_at)
          .map(obj => [
            moment(obj.completed_at).format("dddd"),
            obj["Story Points"] || 0
          ])
          .reduce(
            (accumulator, [weekDay, storyPoints]) => {
              return accumulator.map(obj => [
                obj[0],
                obj[0] === weekDay ? obj[1] + storyPoints : obj[1]
              ]);
            },
            [...fullWeek]
          )
          .sort(
            ([weekDayA], [weekDayB]) =>
              moment().day(weekDayA) - moment().day(weekDayB)
          )
      })),
    [asanaProjectTasks, fullWeek]
  );

  const series = useCallback((series, index) => {
    switch (index) {
      case 0:
        return { type: "bar" };
      case 1:
      default:
        return { type: "bar", position: "bottom" };
    }
  }, []);
  const axes = useMemo(
    () => [
      { primary: true, type: "ordinal", position: "bottom" },
      { position: "left", type: "linear", stacked: true }
    ],
    []
  );

  if (loading) {
    return <div className="loading-spinner centre" />;
  }

  return <Chart data={data} series={series} axes={axes} tooltip dark />;
};

export default GraphStoryPointsThroughWeek;
