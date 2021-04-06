import React, { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import collect from "collect.js";
import Color from "color";
import withColours from "../../withColours";

const SprintStoryPointsTrend = ({ sprints, colours }) => {
  const sprintsCollection = useMemo(
    () => collect(sprints || []).sortBy("number"),
    [sprints]
  );

  const completedSprints = useMemo(
    () => sprintsCollection.where("state", "COMPLETED"),
    [sprintsCollection]
  );

  const data = useMemo(() => {
    const threeWeekAverage = {
      label: "3 Week Average",
      type: "line",
      color: colours.idealTrend,
      data: completedSprints.pluck("averageCompletedStoryPoints").toArray()
    };

    return {
      labels: sprintsCollection.pluck("number").toArray(),
      datasets: [
        {
          label: "Overall Trend",
          type: "line",
          hidden: true,
          color: colours.actualTrend,
          spanGaps: true,
          yAxisID: "y-axis-storypoints",
          data: sprintsCollection
            .pluck("number")
            .map(number => {
              const min = completedSprints.min("number");
              const max = completedSprints.max("number");

              switch (number) {
                case min:
                  return min;
                case max:
                  return max;
                default:
                  return undefined;
              }
            })
            .map(number => {
              if (number) {
                return completedSprints.firstWhere("number", number)
                  .averageCompletedStoryPoints;
              }

              return undefined;
            })
            .toArray()
        },
        { ...threeWeekAverage },
        {
          label: "Committed Story Points",
          type: "bar",
          color: colours.committedStoryPoints,
          yAxisID: "y-axis-storypoints",
          data: sprintsCollection.pluck("storyPoints").toArray()
        },
        {
          label: "Completed Story Points",
          type: "bar",
          color: colours.completedStoryPoints,
          yAxisID: "y-axis-storypoints",
          data: sprintsCollection.pluck("completedStoryPoints").toArray()
        },
        {
          label: "Commitments Met",
          type: "line",
          hidden: true,
          color: colours.completedStoryPoints,
          yAxisID: "y-axis-percentage",
          data: sprintsCollection
            .where("isCompletedSprint")
            .map(({ storyPoints, completedStoryPoints }) =>
              Math.round((completedStoryPoints / parseFloat(storyPoints)) * 100)
            )
            .toArray()
        },
        {
          ...threeWeekAverage,
          label: `${threeWeekAverage.label} Background`,
          fill: true,
          pointRadius: 0,
          borderColor: false,
          backgroundColor: Color("gray")
            .fade(0.75)
            .hex(),
          yAxisID: "y-axis-storypoints"
        }
      ].map(({ color, ...obj }) => ({
        borderColor: color,
        backgroundColor: color,
        fill: false,
        ...obj,
        borderWidth: 1
      }))
    };
  }, [
    sprintsCollection,
    completedSprints,
    colours.idealTrend,
    colours.actualTrend,
    colours.committedStoryPoints,
    colours.completedStoryPoints
  ]);

  const options = useMemo(
    () => ({
      responsive: true,
      showLines: true,
      maintainAspectRatio: false,
      tooltips: {
        mode: "index",
        intersect: false
      },
      scales: {
        xAxes: [
          {
            gridLines: { display: true },
            scaleLabel: { display: false }
          }
        ],
        yAxes: [
          {
            gridLines: { display: false },
            display: true,
            stacked: false,
            position: "left",
            type: "linear",
            scaleLabel: { display: false, labelString: "Story Points" },
            id: "y-axis-storypoints",
            ticks: { beginAtZero: true, precision: 0 }
          },
          {
            gridLines: { display: false },
            display: true,
            stacked: false,
            position: "right",
            type: "linear",
            scaleLabel: { display: false, labelString: "Percentage" },
            id: "y-axis-percentage",
            ticks: {
              beginAtZero: true,
              max: 100,
              callback: function(value) {
                return `${value}%`;
              }
            }
          }
        ]
      }
    }),
    []
  );

  const legend = useMemo(
    () => ({
      display: true,
      labels: {
        filter: ({ text }) => {
          return !text.toLowerCase().includes("background");
        }
      }
    }),
    []
  );

  return (
    <div className="chartjs-min-height w-100 overflow-hidden">
      <Bar data={data} options={options} legend={legend} />
    </div>
  );
};

export default withColours(SprintStoryPointsTrend);
