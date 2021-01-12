import React, { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import collect from "collect.js";
import moment from "moment";
import randomFlatColors from "random-flat-colors";

const StoryPointsPerDay = ({ sprints, showBurnUp, showBurnDown }) => {
  const sprintCollection = useMemo(() => collect(sprints).sortBy("number"), [
    sprints
  ]);

  const daysOfTheWeek = useMemo(() => {
    const { startOn: firstDayOfTheWeek } = sprintCollection.last();
    return collect(
      new Array(sprintCollection.max("sprintLength") + 1).fill(0)
    ).map((obj, index) => firstDayOfTheWeek.isoWeekday() + index);
  }, [sprintCollection]);

  const data = useMemo(
    () => ({
      labels: daysOfTheWeek.toArray(),
      datasets: sprintCollection
        .map(({ number, tasksCompleted, startOn }) => {
          const tasksCompletedCollection = collect(tasksCompleted);

          return {
            label: number,
            backgroundColor: randomFlatColors(),
            borderWidth: 1,
            data: daysOfTheWeek
              .map(obj =>
                tasksCompletedCollection
                  .where("storyPoints")
                  .where("completedAtDayOfSprint", obj)
                  .sum("storyPoints")
              )
              .toArray(),
            yAxisID: "y-axis-daily-sum"
          };
        })
        .toArray()
    }),
    [sprintCollection, daysOfTheWeek]
  );

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      tooltips: {
        callbacks: {
          title: (tooltipItem, data) =>
            `${moment()
              .weekday(tooltipItem[0].label)
              .format("dddd")}`,
          label: (tooltipItem, data) =>
            `Sprint ${data.datasets[tooltipItem.datasetIndex].label}: ${
              tooltipItem.yLabel
            } Story Points`
        }
      },
      scales: {
        xAxes: [
          {
            stacked: true,
            ticks: {
              callback: value => {
                const weekday = value % 7;
                const text = moment()
                  .weekday(value)
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
            stacked: true,
            position: "left",
            id: "y-axis-daily-sum",
            ticks: { beginAtZero: true, precision: 0 }
          },
          {
            type: "linear",
            display: false,
            position: "right",
            id: "y-axis-cummulative-sum",
            ticks: { beginAtZero: true, precision: 0 }
          }
        ]
      }
    }),
    []
  );

  if (sprintCollection.isEmpty()) {
    return <div className="loading-spinner centre" />;
  }

  return <Bar data={data} options={options} />;
};

export default StoryPointsPerDay;
