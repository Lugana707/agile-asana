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

  const sprintTasksMemo = useMemo(
    () => sprints || (asanaProjectTasks || []).filter(obj => obj.archived),
    [sprints, asanaProjectTasks]
  );

  const showBurnUp = sprintTasksMemo.length === 1;

  const data = useMemo(() => {
    const fullWeek = new Array(7).fill(0).map((_, index) => index);

    const sumOfStoryPointsByDay = sprintTasksMemo
      .map(({ week, completedTasks }) => {
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

        const results = [
          { label: `Sprint ${week}`, data, secondaryAxisID: "dailySum" }
        ];

        if (showBurnUp) {
          let totalStoryPoints = 0;
          const sumOfStoryPointsAcrossWeek = {
            label: `Burn Up`,
            data: [
              //[data[0][0], 0],
              ...data.map(([weekday, storyPoints]) => {
                totalStoryPoints += storyPoints;
                return [weekday, totalStoryPoints];
              })
            ],
            secondaryAxisID: "cummulativeSum"
          };
          results.unshift(sumOfStoryPointsAcrossWeek);
        }

        return results;
      })
      .flat();

    return [...sumOfStoryPointsByDay];
  }, [showBurnUp, sprintTasksMemo, hideWeekends, sprintStartDay]);

  const series = useCallback(
    (series, index) => {
      if (showBurnUp && index % 2 === 0) {
        return { type: "line", position: "bottom" };
      }
      switch (index) {
        case 0:
        case 1:
          return { type: "bar" };
        case 2:
        default:
          return { type: "bar", position: "bottom" };
      }
    },
    [showBurnUp]
  );
  const axes = useMemo(
    () => [
      { primary: true, type: "ordinal", position: "bottom" },
      {
        id: "dailySum",
        position: "left",
        type: "linear",
        hardMin: 0,
        format: d => Math.round(d, 0),
        stacked: !showBurnUp
      },
      {
        id: "cummulativeSum",
        position: "right",
        type: "linear",
        hardMin: 0,
        format: d => Math.round(d, 0)
      }
    ],
    [showBurnUp]
  );

  if (loading) {
    return <div className="loading-spinner centre" />;
  }

  return <Chart data={data} series={series} axes={axes} tooltip dark />;
};

export default GraphStoryPointsThroughWeek;
