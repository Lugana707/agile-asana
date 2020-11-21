import React, { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import collect from "collect.js";
import randomFlatColors from "random-flat-colors";

const SprintTagsBarChart = ({ sprint }) => {
  const tasksByTag = useMemo(
    () =>
      collect(sprint.tasks)
        .where("mostRecentSprint", sprint.uuid)
        .map(({ tags, storyPoints = 0 }) =>
          tags.map(tag => ({ tag, storyPoints }))
        )
        .flatten(1)
        .groupBy("tag")
        .map((value, key) => ({
          tag: key,
          storyPoints: value.sum("storyPoints"),
          count: value.count()
        }))
        .pipe(collection => collect(collection.toArray())),
    [sprint]
  );

  const data = useMemo(
    () => ({
      labels: tasksByTag.pluck("tag").toArray(),
      datasets: [
        {
          label: "Story Points",
          backgroundColor: randomFlatColors("green"),
          borderWidth: 1,
          data: tasksByTag.pluck("storyPoints").toArray()
        },
        {
          label: "Task Count",
          backgroundColor: randomFlatColors("blue"),
          borderWidth: 1,
          data: tasksByTag.pluck("count").toArray()
        }
      ]
    }),
    [tasksByTag]
  );

  const options = useMemo(
    () => ({
      maintainAspectRatio: false,
      responsive: true,
      scales: {
        yAxes: [
          {
            ticks: { beginAtZero: true }
          }
        ]
      }
    }),
    []
  );

  return <Bar data={data} options={options} />;
};

export default SprintTagsBarChart;
