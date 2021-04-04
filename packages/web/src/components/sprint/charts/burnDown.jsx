import React, { useMemo, useCallback } from "react";
import { Bar } from "react-chartjs-2";
import collect from "collect.js";
import moment from "moment";
import withSprints from "../withSprints";
import withColours from "../../withColours";

const StoryPointsPerDay = ({ sprint, sprints, colours }) => {
  const {
    storyPoints: committedStoryPoints,
    sprintLength,
    startOn: sprintStartOn,
    tasksCompleted: sprintTasksCompleted
  } = sprint;

  const dayOfWeekForFirstDayOfSprint = useMemo(() => sprintStartOn.weekday(), [
    sprintStartOn
  ]);

  const getStoryPointsForSprintDay = useCallback(
    dayOfWeek =>
      collect(sprintTasksCompleted)
        .where("storyPoints")
        .where(
          "completedAtDayOfSprint",
          dayOfWeek + dayOfWeekForFirstDayOfSprint
        )
        .sum("storyPoints"),
    [sprintTasksCompleted, dayOfWeekForFirstDayOfSprint]
  );

  const daysOfTheWeek = useMemo(
    () =>
      collect(new Array(sprintLength + 1).fill(0))
        .map((obj, index) => obj + index)
        .filter((dayOfWeek, index, array) => {
          if (
            (dayOfWeek + dayOfWeekForFirstDayOfSprint) % 7 === 0 ||
            (dayOfWeek + dayOfWeekForFirstDayOfSprint) % 7 === 6
          ) {
            return !!getStoryPointsForSprintDay(dayOfWeek);
          }

          if (index === array.length - 1) {
            const previousSprint = sprints
              .map(({ finishedOn }) => finishedOn.format("YYYYMMDD"))
              .firstWhere(true, "===", sprintStartOn.format("YYYYMMDD"));

            return !previousSprint || !!getStoryPointsForSprintDay(dayOfWeek);
          }

          return true;
        }),
    [
      sprintLength,
      dayOfWeekForFirstDayOfSprint,
      getStoryPointsForSprintDay,
      sprints,
      sprintStartOn
    ]
  );

  const data = useMemo(
    () => ({
      labels: daysOfTheWeek
        .map(dayOfWeek =>
          moment()
            .weekday(dayOfWeek + sprintStartOn.weekday())
            .format("dddd")
        )
        .toArray(),
      datasets: [
        {
          label: "Burn Down",
          type: "line",
          color: colours.actualTrend,
          data: daysOfTheWeek
            .map(obj => getStoryPointsForSprintDay(obj))
            .map(
              (obj, index, array) =>
                obj +
                collect(array)
                  .take(index)
                  .sum()
            )
            .map(obj => committedStoryPoints - obj)
            .take(moment().diff(sprintStartOn, "days") + 1)
            .toArray()
        },
        {
          label: "Ideal Trend",
          type: "line",
          color: colours.idealTrend,
          pointRadius: 0,
          data: daysOfTheWeek
            .map(
              (obj, index) =>
                (committedStoryPoints / (daysOfTheWeek.count() - 1)) * index
            )
            .reverse()
            .toArray()
        },
        {
          label: "Story Points Done",
          type: "bar",
          hidden: true,
          color: colours.completedStoryPoints,
          data: daysOfTheWeek
            .map(obj => getStoryPointsForSprintDay(obj))
            .toArray()
        }
      ].map(({ color, ...obj }) => ({
        ...obj,
        borderColor: color,
        backgroundColor: color,
        cubicInterpolationMode: "monotone",
        fill: false,
        borderWidth: 1
      }))
    }),
    [
      sprintStartOn,
      getStoryPointsForSprintDay,
      daysOfTheWeek,
      committedStoryPoints,
      colours.idealTrend,
      colours.actualTrend,
      colours.completedStoryPoints
    ]
  );

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      tooltips: {
        mode: "index",
        intersect: false
      },
      scales: {
        yAxes: [
          {
            type: "linear",
            display: true,
            position: "left",
            ticks: { beginAtZero: true, precision: 0 }
          }
        ]
      }
    }),
    []
  );

  if (!sprint) {
    return <div className="loading-spinner centre" />;
  }

  return (
    <div className="chartjs-min-height">
      <Bar data={data} options={options} />
    </div>
  );
};

export default withSprints(withColours(StoryPointsPerDay));
