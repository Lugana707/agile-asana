import React, { useMemo } from "react";
import { Line } from "react-chartjs-2";
import collect from "collect.js";

String.prototype.hashCode = function() {
  var hash = 0,
    i,
    chr;
  if (this.length === 0) return hash;
  for (i = 0; i < this.length; i++) {
    chr = this.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

const GraphStoryPointsTrend = ({
  sprints,
  showCount = false,
  showStoryPoints = true
}) => {
  const sprintCollection = useMemo(() => collect(sprints), [sprints]);

  const tasksByTag = useMemo(
    () =>
      collect(sprints)
        .flatMap(({ state, tasksCompleted, tasks }) =>
          state === "ACTIVE" ? tasks : tasksCompleted
        )
        //.where("mostRecentSprint", sprint.uuid)
        .map(({ tags, storyPoints = 0, mostRecentSprint }) =>
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
                if (a === 0 || b === 0) {
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
    [sprints]
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
          backgroundColor: `#${tag.hashCode().toString(16)}`,
          borderColor: "white",
          borderWidth: 2,
          pointRadius: 0,
          data: tasksByTag
            .where("tag", tag)
            .sortBy("sprint")
            .pluck("storyPoints")
            .toArray()
        }))
        .toArray()
    }),
    [sprintCollection]
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
            display: true,
            stacked: true,
            type: "linear",
            scaleLabel: {
              display: false,
              labelString: "Percentage"
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
