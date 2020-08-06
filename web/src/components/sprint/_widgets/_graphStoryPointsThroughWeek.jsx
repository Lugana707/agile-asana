import React, { useMemo, useCallback } from "react";
import { Chart } from "react-charts";
import { useSelector } from "react-redux";
import collect from "collect.js";
import moment from "moment";

const GraphStoryPointsThroughWeek = ({ sprints, showBurnUp, showBurnDown }) => {
  const { loading, asanaProjectTasks } = useSelector(
    state => state.asanaProjectTasks
  );

  const hideWeekends = true;

  const sprintTasks = useMemo(() => sprints || asanaProjectTasks || [], [
    sprints,
    asanaProjectTasks
  ]);

  const maxStoryPoints = useMemo(
    () =>
      showBurnUp || showBurnDown
        ? collect(sprints)
            .map(({ committedStoryPoints, completedStoryPoints }) =>
              Math.max(committedStoryPoints, completedStoryPoints)
            )
            .max()
        : undefined,
    [sprints, showBurnUp, showBurnDown]
  );

  const data = useMemo(() => {
    const sumOfStoryPointsByDay = sprintTasks
      .map(
        ({
          week,
          completedTasks,
          startOn,
          sprintLength,
          committedStoryPoints
        }) => {
          const fullSprint = new Array(sprintLength + 1)
            .fill(moment(startOn).weekday())
            .map((startDay, index) => startDay + index);

          const dataGroupedByDayOfSprint = collect(completedTasks)
            .filter(
              obj =>
                obj.completedAtDayOfSprint !== undefined && !!obj.storyPoints
            )
            .map(task => ({
              ...task,
              completedAtDayOfSprint: task.completedAtDayOfSprint
            }))
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
              const weekday = completedAtDayOfSprint % 7;
              return weekday !== 6 && weekday !== 0;
            })
            .sortBy("completedAtDayOfSprint")
            .map(obj => [obj.completedAtDayOfSprint, obj.storyPoints])
            .all();

          const results = [
            { label: `Sprint ${week}`, data, secondaryAxisID: "dailySum" }
          ];

          if (showBurnUp || showBurnDown) {
            let startingCummulativeStoryPoints = 0;
            let label = "Burn Up";
            let operation = (runningTotal, storyPoints) =>
              runningTotal + storyPoints;

            if (showBurnDown) {
              startingCummulativeStoryPoints = committedStoryPoints;
              label = "Burn Down";
              operation = (runningTotal, storyPoints) =>
                runningTotal - storyPoints;
            }

            let cummulativeStoryPoints = startingCummulativeStoryPoints;
            let trendStoryPoints = startingCummulativeStoryPoints;

            const trend = {
              label: "Ideal Trend",
              data: [[-1, startingCummulativeStoryPoints]],
              secondaryAxisID: "cummulativeSum"
            };
            const sumOfStoryPointsAcrossWeek = {
              label,
              data: [[-1, startingCummulativeStoryPoints]],
              secondaryAxisID: "cummulativeSum"
            };

            data.forEach(([sprintDay, storyPoints]) => {
              if (
                moment(startOn)
                  .add(sprintDay - moment(startOn).weekday(), "days")
                  .isBefore(moment())
              ) {
                cummulativeStoryPoints = operation(
                  cummulativeStoryPoints,
                  storyPoints
                );
                sumOfStoryPointsAcrossWeek.data.push([
                  sprintDay,
                  cummulativeStoryPoints
                ]);
              }

              trendStoryPoints = operation(
                trendStoryPoints,
                committedStoryPoints / data.length
              );
              trend.data.push([sprintDay, trendStoryPoints]);
            });

            results.unshift(sumOfStoryPointsAcrossWeek);
            results.unshift(trend);
          }

          return results;
        }
      )
      .flat();

    return [...sumOfStoryPointsByDay];
  }, [showBurnUp, showBurnDown, sprintTasks, hideWeekends]);

  const series = useCallback(
    (series, index) => {
      if ((showBurnUp || showBurnDown) && index < 2) {
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
    [showBurnUp, showBurnDown]
  );
  const axes = useMemo(
    () => [
      {
        primary: true,
        type: "ordinal",
        position: "bottom",
        format: d =>
          d < 0
            ? ""
            : moment()
                .weekday(d)
                .format("dddd")
      },
      {
        id: "dailySum",
        position: "left",
        type: "linear",
        hardMin: 0,
        hardMax: maxStoryPoints,
        format: d => Math.round(d, 0),
        stacked: !showBurnUp
      },
      {
        id: "cummulativeSum",
        position: "right",
        type: "linear",
        hardMin: 0,
        hardMax: maxStoryPoints,
        format: d => Math.round(d, 0)
      }
    ],
    [showBurnUp, maxStoryPoints]
  );

  if (loading) {
    return <div className="loading-spinner centre" />;
  }

  return <Chart data={data} series={series} axes={axes} tooltip dark />;
};

export default GraphStoryPointsThroughWeek;
