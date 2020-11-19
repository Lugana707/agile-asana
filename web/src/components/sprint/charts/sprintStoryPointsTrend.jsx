import React, { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import collect from "collect.js";
import randomFlatColors from "random-flat-colors";

const SprintStoryPointsTrend = ({ sprints = [] }) => {
  const sprintsCollection = useMemo(() => collect(sprints).sortBy("number"), [
    sprints
  ]);

  const completedSprints = useMemo(
    () => sprintsCollection.where("state", "COMPLETED"),
    [sprintsCollection]
  );

  const data = useMemo(
    () => ({
      labels: sprintsCollection.pluck("number").toArray(),
      datasets: [
        {
          label: "3 Week Average",
          type: "line",
          color: randomFlatColors("gray"),
          data: completedSprints.pluck("averageCompletedStoryPoints").toArray()
        },
        {
          label: "Overall Trend",
          type: "line",
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
            .toArray(),
          dataOld: completedSprints
            .whereIn("number", [
              completedSprints.min("number"),
              completedSprints.max("number")
            ])
            .pluck("averageCompletedStoryPoints")
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
        ...obj,
        borderColor: color,
        backgroundColor: color,
        fill: false,
        borderWidth: 1
      }))
    }),
    [sprintsCollection, completedSprints]
  );

  const options = useMemo(
    () => ({
      responsive: true,
      showLines: true,
      maintainAspectRatio: false,
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
            ticks: { min: 0 }
          }
        ]
      }
    }),
    []
  );

  return <Bar data={data} options={options} />;
};

export default SprintStoryPointsTrend;
