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

  const convertSprintdayToWeekday = sprintday =>
    (sprintday + sprintStartDay) % 7;

  const hideWeekends = true;

  const sprintTasksMemo = useMemo(
    () => sprints || (asanaProjectTasks || []).filter(obj => obj.archived),
    [sprints, asanaProjectTasks]
  );

  const showBurnUp = sprintTasksMemo.length === 1;

  console.debug("Hello sprint!", { sprintTasksMemo });

  const data = useMemo(() => {
    const sumOfStoryPointsByDay = sprintTasksMemo
      .map(({ week, completedTasks, startedAt, dueOn, sprintLength }) => {
        const fullSprint = new Array(sprintLength + 1)
          .fill(0)
          .map((_, index) => index);

        const dataGroupedByDayOfSprint = collect(completedTasks)
          .filter(
            obj => obj.completedAtDayOfSprint !== undefined && !!obj.storyPoints
          )
          .groupBy("completedAtDayOfSprint")
          .all();

        const data = collect(fullSprint)
          .map(dayOfSprint => {
            const datum =
              dataGroupedByDayOfSprint[dayOfSprint] ||
              collect([
                {
                  completedAtDayOfSprint: dayOfSprint,
                  storyPoints: 0
                }
              ]);
            const { completedAtDayOfSprint } = datum.first();
            return {
              completedAtDayOfSprint,
              storyPoints: datum.sum("storyPoints")
            };
          })
          .filter(({ completedAtDayOfSprint }) => {
            if (!hideWeekends) {
              return true;
            }
            const weekday = convertSprintdayToWeekday(completedAtDayOfSprint);
            return weekday !== 6 && weekday !== 0;
          })
          .sortBy("completedAtDayOfSprint")
          .map(obj => [obj.completedAtDayOfSprint, obj.storyPoints])
          .all();

        const results = [
          { label: `Sprint ${week}`, data, secondaryAxisID: "dailySum" }
        ];

        if (showBurnUp) {
          let totalStoryPoints = 0;
          const sumOfStoryPointsAcrossWeek = {
            label: `Burn Up`,
            data: [
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
      {
        primary: true,
        type: "ordinal",
        position: "bottom",
        format: d =>
          moment()
            .weekday(convertSprintdayToWeekday(d))
            .format("dddd")
      },
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
