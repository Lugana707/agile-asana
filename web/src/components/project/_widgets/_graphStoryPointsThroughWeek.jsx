import React, { useMemo, useCallback } from "react";
import { Chart } from "react-charts";
import { useSelector } from "react-redux";
import collect from "collect.js";
import moment from "moment";

const GraphStoryPointsThroughWeek = ({ sprints }) => {
  const { sprintStartDay = 2 } = useSelector(state => state.settings);
  const { loading, asanaProjectTasks } = useSelector(
    state => state.asanaProjectTasks
  );

  const hideWeekends = true;

  const data = useMemo(() => {
    const fullWeek = new Array(7).fill(0).map((_, index) => index);

    const sprintTasks =
      sprints || (asanaProjectTasks || []).filter(obj => obj.archived);

    return sprintTasks.map(({ week, completedTasks }) => {
      const dataGroupedByDayOfSprint = collect(completedTasks)
        .filter(obj => !!obj.completedAt && !!obj.storyPoints)
        .groupBy("completedAt.dayOfSprint")
        .all();

      const data = collect(fullWeek)
        .map(weekday => {
          const dayOfSprint = (weekday + 7 - sprintStartDay) % 7;
          const datum = dataGroupedByDayOfSprint[dayOfSprint];
          if (!datum) {
            return {
              completedAt: {
                dayOfWeek: weekday,
                dayOfSprint: dayOfSprint
              },
              storyPoints: 0
            };
          }
          const { completedAt } = datum.first();
          return {
            completedAt,
            storyPoints: datum.sum("storyPoints")
          };
        })
        .filter(
          ({ completedAt }) =>
            !hideWeekends || ![6, 0].includes(completedAt.dayOfWeek)
        )
        .sortBy("completedAt.dayOfSprint")
        .map(obj => [
          moment()
            .weekday(obj.completedAt.dayOfWeek)
            .format("dddd"),
          obj.storyPoints
        ])
        .all();

      return { label: `Sprint ${week}`, data };
    });
  }, [asanaProjectTasks, sprints, hideWeekends, sprintStartDay]);

  const series = useCallback((series, index) => {
    switch (index) {
      case 0:
      case 1:
        return { type: "bar" };
      case 2:
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
