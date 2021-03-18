import React, { useMemo } from "react";
import { Line } from "react-chartjs-2";
import { useSelector } from "react-redux";
import collect from "collect.js";

const GraphStoryPointsTrend = ({ sprints }) => {
  const { data: fullListOfTags } = useSelector(state => state.tags);

  const sprintCollection = useMemo(() => collect(sprints), [sprints]);
  const tagsCollection = useMemo(() => collect(fullListOfTags), [
    fullListOfTags
  ]);

  const tasksByTag = useMemo(
    () =>
      sprintCollection
        .flatMap(({ isCurrentSprint, tasksCompleted, tasks }) =>
          isCurrentSprint ? tasks.toArray() : tasksCompleted.toArray()
        )
        .map(({ tags = [], storyPoints = 0, mostRecentSprint, number }) =>
          tags.map(tag => ({
            tag,
            storyPoints,
            sprint: sprintCollection.firstWhere("uuid", mostRecentSprint).number
          }))
        )
        .flatten(1)
        .groupBy("tag")
        .pipe(collection =>
          collection.map((value, key) => {
            return sprintCollection.pluck("number").map(number => {
              const filteredBySprint = collection
                .flatten(1)
                .where("sprint", number);
              const filteredBySprintAndTag = filteredBySprint.where("tag", key);

              const getPercentage = (a, b) => {
                if (!a || !b) {
                  return 0;
                }
                return (a / b) * 100;
              };

              const storyPoints = getPercentage(
                filteredBySprintAndTag.sum("storyPoints"),
                filteredBySprint.sum("storyPoints")
              );
              const count = getPercentage(
                filteredBySprintAndTag.count(),
                filteredBySprint.count()
              );

              return {
                tag: key,
                storyPoints,
                count,
                sprint: number
              };
            });
          })
        )
        .flatten(1)
        .pipe(collection => collect(collection.toArray())),
    [sprintCollection]
  );

  const data = useMemo(
    () => ({
      labels: sprintCollection
        .pluck("number")
        .sort()
        .toArray(),
      datasets: tasksByTag
        .where("storyPoints")
        .pluck("tag")
        .unique()
        .map(tag => ({
          label: tag,
          backgroundColor: tagsCollection.firstWhere("name", tag).color,
          borderColor: "white",
          borderWidth: 1,
          pointRadius: 0,
          data: tasksByTag
            .where("tag", tag)
            .sortBy("sprint")
            .pluck("storyPoints")
            .toArray()
        }))
        .toArray()
    }),
    [sprintCollection, tagsCollection, tasksByTag]
  );

  const options = useMemo(
    () => ({
      responsive: true,
      showLines: true,
      maintainAspectRatio: false,
      scales: {
        xAxes: [
          {
            gridLines: {
              display: true
            },
            scaleLabel: {
              display: false,
              labelString: "Sprint"
            }
          }
        ],
        yAxes: [
          {
            gridLines: {
              display: false
            },
            display: false,
            stacked: true,
            type: "linear",
            scaleLabel: {
              display: false,
              labelString: "Percentage"
            },
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
      position: "bottom"
    }),
    []
  );

  return <Line data={data} options={options} legend={legend} />;
};

export default GraphStoryPointsTrend;
