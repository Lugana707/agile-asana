import React, { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import collect from "collect.js";
import randomFlatColors from "random-flat-colors";
import Color from "color";

const SprintStoryPointsTrend = ({ sprints = [] }) => {
  const sprintsCollection = useMemo(() => collect(sprints).sortBy("number"), [
    sprints
  ]);

  const completedSprints = useMemo(
    () => sprintsCollection.where("state", "COMPLETED"),
    [sprintsCollection]
  );

  const data = useMemo(() => {
    const gray = Color(randomFlatColors("gray")).darken(0.2);

    return {
      labels: sprintsCollection.pluck("number").toArray(),
      datasets: [
        {
          label: "3 Week Average",
          type: "line",
          fill: true,
          borderColor: gray.hex(),
          backgroundColor: gray.fade(0.75).hex(),
          data: completedSprints.pluck("averageCompletedStoryPoints").toArray()
        },
        {
          label: "Overall Trend",
          type: "line",
          hidden: true,
          color: randomFlatColors("white"),
          spanGaps: true,
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
        {
          label: "Committed Story Points",
          type: "bar",
          color: randomFlatColors("orange"),
          data: sprintsCollection.pluck("storyPoints").toArray()
        },
        {
          label: "Completed Story Points",
          type: "bar",
          color: randomFlatColors("yellow"),
          data: sprintsCollection.pluck("completedStoryPoints").toArray()
        }
      ].map(({ color, ...obj }) => ({
        borderColor: color,
        backgroundColor: color,
        fill: false,
        ...obj,
        borderWidth: 1
      }))
    };
  }, [sprintsCollection, completedSprints]);

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
            type: "linear",
            scaleLabel: { display: false },
            ticks: { beginAtZero: true, precision: 0 }
          }
        ]
      }
    }),
    []
  );

  return <Bar data={data} options={options} />;
};

export default SprintStoryPointsTrend;
