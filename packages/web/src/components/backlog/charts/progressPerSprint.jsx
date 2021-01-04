import React, { useMemo, useCallback } from "react";
import { Bar } from "react-chartjs-2";
import { useSelector } from "react-redux";
import moment from "moment";
import collect from "collect.js";
import Color from "color";
import randomFlatColors from "random-flat-colors";
import withBacklogTasks from "../withBacklogTasks";
import { ALL_TAGS_TAG } from "../../library/tags/filter";

const BacklogProgressPerSprint = ({
  backlogTasks,
  sprints,
  tags: displayTags,
  weight = false
}) => {
  const { tags: fullListOfTags } = useSelector(state => state.tags);

  const getAsanaTagColor = useCallback(
    tag =>
      Color(
        tag === ALL_TAGS_TAG
          ? randomFlatColors("blue")
          : collect(fullListOfTags).firstWhere("name", tag).color
      ),
    [fullListOfTags]
  );

  const sprintsCollection = useMemo(() => collect(sprints).sortBy("number"), [
    sprints
  ]);

  const getBacklogCountPerSprint = useCallback(
    tag => {
      const mappedBacklogTasks = backlogTasks
        .when(tag !== ALL_TAGS_TAG, collection =>
          collection.filter(({ tags }) => tags.includes(tag))
        )
        .map(({ createdAt, completedAt, storyPoints }) => ({
          createdAt: createdAt.unix(),
          completedAt: completedAt && completedAt.unix(),
          storyPoints
        }));

      return sprintsCollection
        .map(({ startOn, finishedOn }) => ({
          startOn: startOn.unix(),
          finishedOn: finishedOn.unix()
        }))
        .prepend({
          startOn: moment("1990-03-10").unix(),
          finishedOn: sprintsCollection
            .pluck("startOn")
            .map(date => date.unix())
            .sort()
            .first()
        })
        .map(({ startOn, finishedOn }) => {
          const filterTasksByDate = key =>
            mappedBacklogTasks
              .where(key)
              .whereBetween(key, [startOn, finishedOn]);

          const createdAtCollection = filterTasksByDate("createdAt");
          const completedAtCollection = filterTasksByDate("completedAt");

          const storyPoints = {
            createdAt: createdAtCollection
              .where("storyPoints")
              .sum("storyPoints"),
            completedAt: -completedAtCollection
              .where("storyPoints")
              .sum("storyPoints")
          };
          const count = {
            createdAt: createdAtCollection.count(),
            completedAt: -completedAtCollection.count()
          };

          return {
            storyPoints: {
              ...storyPoints,
              delta: storyPoints.createdAt + storyPoints.completedAt
            },
            count: {
              ...count,
              delta: count.createdAt + count.completedAt
            }
          };
        })
        .map(({ storyPoints, count }, index, self) => {
          const { delta: storyPointsDelta } = storyPoints;
          const { delta: countDelta } = count;

          return {
            storyPoints: {
              ...storyPoints,
              runningTotal:
                storyPointsDelta +
                collect(self)
                  .take(index)
                  .pluck("storyPoints.delta")
                  .sum()
            },
            count: {
              ...count,
              runningTotal:
                countDelta +
                collect(self)
                  .take(index)
                  .pluck("count.delta")
                  .sum()
            }
          };
        })
        .skip(1);
    },
    [backlogTasks, sprintsCollection]
  );

  const tags = useMemo(
    () =>
      backlogTasks
        .pluck("tags")
        .flatten(1)
        .unique()
        .sort()
        .filter(tag => displayTags.where(true, tag).isNotEmpty())
        .when(displayTags.isEmpty(), collection =>
          collection.prepend(ALL_TAGS_TAG)
        ),
    [backlogTasks, displayTags]
  );

  const getBacklogCountPerSprintByTag = useCallback(
    type =>
      tags
        .map(tag => ({ tag, data: getBacklogCountPerSprint(tag) }))
        .map(({ data, ...obj }) => ({
          ...obj,
          count: data.pluck(weight || "count").pluck(type)
        })),
    [tags, getBacklogCountPerSprint, weight]
  );

  const data = useMemo(() => {
    const getBarChartConfig = tag => ({
      yAxisID: tag === ALL_TAGS_TAG ? "y-axis-progress-all" : "y-axis-progress",
      type: "bar"
    });

    return {
      labels: sprintsCollection.pluck("number").toArray(),
      datasets: collect([])
        .merge(
          getBacklogCountPerSprintByTag("runningTotal")
            .map(({ tag, count }) => ({
              label: tag,
              key: `${tag}-running-total`,
              type: "line",
              data: count.toArray(),
              color: getAsanaTagColor(tag).hex(),
              pointRadius: 0,
              yAxisID: "y-axis-running-total"
            }))
            .toArray()
        )
        .merge(
          getBacklogCountPerSprintByTag("createdAt")
            .map(({ tag, count }) => ({
              ...getBarChartConfig(tag),
              label: tag,
              key: `${tag}-created-at`,
              data: count.toArray(),
              color: getAsanaTagColor(tag)
                .desaturate(0.15)
                .hex()
            }))
            .reverse()
            .toArray()
        )
        .merge(
          getBacklogCountPerSprintByTag("completedAt")
            .map(({ tag, count }) => ({
              ...getBarChartConfig(tag),
              label: tag,
              key: `${tag}-completed-at`,
              data: count.toArray(),
              color: getAsanaTagColor(tag)
                .saturate(0.15)
                .hex()
            }))
            .reverse()
            .toArray()
        )
        .map(({ tag, color, ...obj }) => ({
          ...obj,
          borderColor: color,
          backgroundColor: color,
          fill: false,
          borderWidth: 1
        }))
        .toArray()
    };
  }, [getBacklogCountPerSprintByTag, sprintsCollection, getAsanaTagColor]);

  const { min: suggestedMin, max: suggestedMax } = useMemo(
    () =>
      collect(["runningTotal", "createdAt", "completedAt"])
        .map(key => getBacklogCountPerSprintByTag(key))
        .flatten(1)
        .pluck("count")
        .flatten(1)
        .pipe(collection => ({
          min: collection.min(),
          max: collection.max()
        })),
    [getBacklogCountPerSprintByTag]
  );

  const options = useMemo(() => {
    const barChartYAxis = {
      type: "linear",
      display: false,
      stacked: true,
      position: "right",
      ticks: {
        suggestedMin,
        suggestedMax,
        precision: 0
      }
    };

    return {
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
            display: true,
            stacked: true,
            labelString: "Sprint"
          }
        ],
        yAxes: [
          {
            type: "linear",
            display: true,
            stacked: false,
            position: "left",
            id: "y-axis-running-total",
            ticks: {
              suggestedMin,
              suggestedMax,
              precision: 0
            }
          },
          { ...barChartYAxis, id: "y-axis-progress" },
          { ...barChartYAxis, id: "y-axis-progress-all" }
        ]
      }
    };
  }, [suggestedMin, suggestedMax]);

  if (getBacklogCountPerSprint(ALL_TAGS_TAG).isEmpty()) {
    return <div className="loading-spinner centre" />;
  }

  return (
    <div className="chartjs-min-height w-100 overflow-hidden">
      <Bar
        data={data}
        options={options}
        legend={{ display: false }}
        datasetKeyProvider={({ key }) => key}
      />
    </div>
  );
};

export default withBacklogTasks(BacklogProgressPerSprint);
