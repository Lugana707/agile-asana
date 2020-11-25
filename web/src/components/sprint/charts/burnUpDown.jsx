import React, { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import collect from "collect.js";
import moment from "moment";
import randomFlatColors from "random-flat-colors";

const StoryPointsPerDay = ({ sprint }) => {
  const burnUp = useMemo(() => sprint.state === "COMPLETED", [sprint]);

  const { storyPoints: committedStoryPoints } = sprint;

  const daysOfTheWeek = useMemo(
    () =>
      collect(new Array(sprint.sprintLength + 1).fill(0)).map(
        (obj, index) => sprint.startOn.isoWeekday() + index
      ),
    [sprint]
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
            .map(obj =>
              collect(sprint.tasksCompleted)
                .where("storyPoints")
                .where("completedAtDayOfSprint", obj)
                .sum("storyPoints")
            )
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
            .take(sprint.startOn.diff(moment(), "days") + 1)
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
            .map(obj =>
              collect(sprint.tasksCompleted)
                .where("storyPoints")
                .where("completedAtDayOfSprint", obj)
                .sum("storyPoints")
            )
            .toArray()
        }
      ]
        .filter(Boolean)
        .map(({ color, ...obj }) => ({
          ...obj,
          borderColor: color,
          backgroundColor: color,
          cubicInterpolationMode: "monotone",
          fill: false,
          borderWidth: 1
        }))
    }),
    [sprint, daysOfTheWeek, burnUp, committedStoryPoints]
  );

  const options = useMemo(
    () => ({
      maintainAspectRatio: false,
      responsive: true,
      scales: {
        xAxes: [
          {
            ticks: {
              callback: value => {
                const weekday = value % 7;
                const text = moment()
                  .weekday(value)
                  .format("dddd");

                if (weekday === 6 || weekday === 0) {
                  return `${text}!`;
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
            ticks: { beginAtZero: true }
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
    <div className="h-100" style={{ minHeight: "300px" }}>
      <Bar data={data} options={options} />
    </div>
  );
};

export default StoryPointsPerDay;
