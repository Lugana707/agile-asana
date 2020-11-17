import React, { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import collect from "collect.js";

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
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 1,
          hoverBackgroundColor: "rgba(255, 99, 132, 0.4)",
          hoverBorderColor: "rgba(255, 99, 132, 1)",
          data: tasksByTag.pluck("storyPoints").toArray()
        },
        {
          label: "Task Count",
          backgroundColor: "rgb(54, 162, 235, 0.2)",
          borderColor: "rgba(54, 162, 235)",
          borderWidth: 1,
          hoverBackgroundColor: "rgba(54, 162, 235, 0.4)",
          hoverBorderColor: "rgba(54, 162, 235, 1)",
          data: tasksByTag.pluck("count").toArray()
        }
      ]
    }),
    [tasksByTag]
  );

  const options = useMemo(() => ({ maintainAspectRatio: false }), []);

  return <Bar data={data} options={options} />;
};

export default SprintTagsBarChart;
