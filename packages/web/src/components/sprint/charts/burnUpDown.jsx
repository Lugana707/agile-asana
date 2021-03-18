import React, { useMemo, useCallback } from "react";
import { Bar } from "react-chartjs-2";
import collect from "collect.js";
import moment from "moment";
import randomFlatColors from "random-flat-colors";

const StoryPointsPerDay = ({ sprint }) => {
  const {
    state: sprintState,
    storyPoints: committedStoryPoints,
    sprintLength,
    startOn: sprintStartOn,
    tasksCompleted: sprintTasksCompleted
  } = sprint;

  const burnUp = useMemo(() => sprintState === "COMPLETED", [sprintState]);

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
            (dayOfWeek + dayOfWeekForFirstDayOfSprint) % 7 === 6 ||
            index === array.length - 1
          ) {
            return !!getStoryPointsForSprintDay(dayOfWeek);
          }

          return true;
        })
        .dump(),
    [sprintLength, dayOfWeekForFirstDayOfSprint, getStoryPointsForSprintDay]
  );

  const data = useMemo(
    () => ({
      labels: daysOfTheWeek.toArray(),
      datasets: [
        {
          label: burnUp ? "Burn Up" : "Burn Down",
          type: "line",
          color: randomFlatColors("gray"),
          data: daysOfTheWeek
            .map(obj => getStoryPointsForSprintDay(obj))
            .map(
              (obj, index, array) =>
                obj +
                collect(array)
                  .take(index)
                  .sum()
            )
            .when(!burnUp, collection =>
              collection.map(obj => committedStoryPoints - obj)
            )
            .take(moment().diff(sprintStartOn, "days") + 1)
            .toArray()
        },
        {
          label: "Ideal Trend",
          type: "line",
          color: randomFlatColors("white"),
          pointRadius: 0,
          data: daysOfTheWeek
            .map(
              (obj, index) =>
                (committedStoryPoints / (daysOfTheWeek.count() - 1)) * index
            )
            .when(!burnUp, collection => collection.reverse())
            .toArray()
        },
        {
          label: "Story Points",
          type: "bar",
          color: randomFlatColors("orange"),
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
      burnUp,
      committedStoryPoints
    ]
  );

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      tooltips: {
        callbacks: {
          title: (tooltipItem, data) =>
            `${moment()
              .weekday(
                parseInt(tooltipItem[0].label, 10) + sprintStartOn.weekday()
              )
              .format("dddd")}`
        }
      },
      scales: {
        xAxes: [
          {
            ticks: {
              callback: value => {
                const dayOfWeek = value + sprintStartOn.weekday();
                const weekday = dayOfWeek % 7;
                const text = moment()
                  .weekday(dayOfWeek)
                  .format("dddd");

                if (weekday === 6 || weekday === 0) {
                  return `${text}*`;
                }

                return text;
              }
            }
          }
        ],
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
    [sprintStartOn]
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

export default StoryPointsPerDay;
