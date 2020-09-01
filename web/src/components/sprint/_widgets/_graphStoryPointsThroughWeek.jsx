import React, { useMemo, useCallback } from "react";
import { Chart } from "react-charts";
import { useSelector } from "react-redux";
import collect from "collect.js";
import moment from "moment";

const GraphStoryPointsThroughWeek = ({ sprints, showBurnUp, showBurnDown }) => {
  const { loading, ...state } = useSelector(state => state.sprints);

  const hideWeekends = true;

  const sprintCollection = useMemo(() => {
    if (sprints) {
      return collect(sprints);
    }
    return collect(state.sprints)
      .where("state", "COMPLETED")
      .all();
  }, [sprints, state.sprints]);

  const maxStoryPoints = useMemo(
    () =>
      showBurnUp || showBurnDown
        ? collect(sprints)
            .map(({ storyPoints, completedStoryPoints }) =>
              Math.max(storyPoints, completedStoryPoints)
            )
            .max()
        : undefined,
    [sprints, showBurnUp, showBurnDown]
  );

  const data = useMemo(() => {
    const sumOfStoryPointsByDay = sprintCollection
      .dump()
      .map(
        ({
          number,
          tasksCompleted,
          startOn,
          sprintLength,
          storyPoints: committedStoryPoints
        }) => {
          const fullSprint = new Array(sprintLength + 1)
            .fill(moment(startOn).weekday())
            .map((startDay, index) => startDay + index);

          const dataGroupedByDayOfSprint = collect(tasksCompleted)
            .where("completedAtDayOfSprint")
            .where("storyPoints")
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
            { label: `Sprint ${number}`, data, secondaryAxisID: "dailySum" }
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
      .flatten(1);

    return [...sumOfStoryPointsByDay];
  }, [showBurnUp, showBurnDown, sprintCollection, hideWeekends]);

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
        format: d => ""
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
