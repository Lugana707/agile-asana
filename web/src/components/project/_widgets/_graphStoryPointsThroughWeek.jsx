import React, { useMemo, useCallback } from "react";
import { Chart } from "react-charts";
import { useSelector } from "react-redux";
import moment from "moment";

const GraphStoryPointsThroughWeek = () => {
  const { sprintStartDay = 2 } = useSelector(state => state.settings);
  const { loading, asanaProjectTasks = [] } = useSelector(
    state => state.asanaProjectTasks
  );

  const hideWeekends = true;

  const projectTasks = (asanaProjectTasks || []).filter(
    ({ archived }) => !!archived
  );

  const fullWeek = moment.weekdays().map(weekDay => [weekDay, 0]);
  const data = useMemo(
    () =>
      projectTasks.map(obj => ({
        label: `Sprint ${obj.week}`,
        data: obj.completedTasks
          .filter(obj => obj.completed_at)
          .map(obj => [
            moment(obj.completed_at).format("dddd"),
            obj.storyPoints || 0
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
          .filter(
            ([weekday]) =>
              !hideWeekends ||
              !(
                weekday ===
                  moment()
                    .weekday(6)
                    .format("dddd") ||
                weekday ===
                  moment()
                    .weekday(7)
                    .format("dddd")
              )
          )
          .sort(([weekDayA], [weekDayB]) => {
            console.debug("Hello weekday!", moment().weekday(6));
            const momentA =
              parseInt(
                moment()
                  .day(weekDayA)
                  .add(-sprintStartDay, "Days")
                  .format("d"),
                10
              ) % 7;
            const momentB =
              parseInt(
                moment()
                  .day(weekDayB)
                  .add(-sprintStartDay, "Days")
                  .format("d"),
                10
              ) % 7;
            return momentA - momentB;
          })
      })),
    [projectTasks, fullWeek, sprintStartDay]
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
