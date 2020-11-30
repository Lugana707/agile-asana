import React, { useMemo, useCallback } from "react";
import { Bar } from "react-chartjs-2";
import { useSelector } from "react-redux";
import moment from "moment";
import collect from "collect.js";
import Color from "color";
import randomFlatColors from "random-flat-colors";
import withBacklogTasks from "../withBacklogTasks";
import withSprints from "../../sprint/withSprints";
import { getColourFromTag } from "../../../scripts/helpers/asanaColours";

const ALL_TAGS_TAG = "All";

const BacklogProgressPerSprint = ({
  backlogTasks,
  sprints,
  tags: displayTags,
  weight = false
}) => {
  const { asanaTags } = useSelector(state => state.asanaTags);

  const getAsanaTagColor = useCallback(
    tag => {
      const tagsCollection = collect(asanaTags);

      const color =
        tag === ALL_TAGS_TAG
          ? randomFlatColors("blue")
          : getColourFromTag(tagsCollection.firstWhere("name", tag.tag));
      return Color(color);
    },
    [asanaTags]
  );

  const sprintsCollection = useMemo(() => sprints.sortBy("week"), [sprints]);

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

      const backlogCountPerSprint = collect(sprintsCollection.toArray())
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
        });

      backlogCountPerSprint.pop();
      return backlogCountPerSprint;
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
        .reverse()
        .push(ALL_TAGS_TAG)
        .reverse(),
    [backlogTasks]
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

  const data = useMemo(
    () => ({
      labels: sprintsCollection.pluck("number").toArray(),
      datasets: [
        ...getBacklogCountPerSprintByTag("runningTotal")
          .map(({ tag, count }) => ({
            tag,
            type: "line",
            data: count.toArray(),
            color: getAsanaTagColor(tag).hex(),
            pointRadius: 0,
            xAxisID: "x-axis-running-total",
            yAxisID: "y-axis-running-total"
          }))
          .toArray(),
        ...getBacklogCountPerSprintByTag("createdAt")
          .map(({ tag, count }) => ({
            tag,
            type: "bar",
            data: count.toArray(),
            color: getAsanaTagColor(tag)
              .desaturate(0.3)
              .hex(),
            xAxisID: "x-axis-progress",
            yAxisID: "y-axis-progress"
          }))
          .toArray(),
        ...getBacklogCountPerSprintByTag("completedAt")
          .map(({ tag, count }) => ({
            tag,
            type: "bar",
            data: count.toArray(),
            color: getAsanaTagColor(tag)
              .saturate(0.3)
              .hex(),
            xAxisID: "x-axis-progress",
            yAxisID: "y-axis-progress"
          }))
          .toArray()
      ].map(({ tag, color, ...obj }) => ({
        ...obj,
        label: tag,
        hidden: tag !== ALL_TAGS_TAG && !displayTags.includes(tag),
        borderColor: color,
        backgroundColor: color,
        fill: false,
        borderWidth: 1
      }))
    }),
    [
      getBacklogCountPerSprintByTag,
      displayTags,
      sprintsCollection,
      getAsanaTagColor
    ]
  );

  const maxMinCount = useMemo(() => {
    const collection = collect(["runningTotal", "createdAt", "completedAt"])
      .map(key => getBacklogCountPerSprintByTag(key))
      .flatten(1)
      .pluck("count")
      .flatten(1)
      .dump();
    return {
      min: collection.min(),
      max: collection.max()
    };
  }, [getBacklogCountPerSprintByTag]);

  const options = useMemo(
    () => ({
      showLines: true,
      maintainAspectRatio: false,
      responsive: true,
      scales: {
        xAxes: [
          { display: false, stacked: true, id: "x-axis-progress" },
          { id: "x-axis-running-total" }
        ],
        yAxes: [
          {
            type: "linear",
            display: false,
            stacked: true,
            position: "right",
            id: "y-axis-progress",
            ticks: {
              suggestedMin: maxMinCount.min,
              suggestedMax: maxMinCount.max,
              precision: 0
            }
          },
          {
            type: "linear",
            display: true,
            position: "left",
            id: "y-axis-running-total",
            ticks: {
              suggestedMin: maxMinCount.min,
              suggestedMax: maxMinCount.max,
              precision: 0
            }
          }
        ]
      }
    }),
    [maxMinCount]
  );

  const legend = useMemo(
    () => ({
      display: true,
      position: "bottom"
    }),
    []
  );

  if (getBacklogCountPerSprint(ALL_TAGS_TAG).isEmpty()) {
    return <div className="loading-spinner centre" />;
  }

  return (
    <div
      className="w-100 overflow-hidden"
      style={{ minHeight: "300px", height: "50vh" }}
    >
      <Bar data={data} options={options} legend={legend} />
    </div>
  );
};

export default withBacklogTasks(withSprints(BacklogProgressPerSprint));
