import React, { useMemo, useCallback } from "react";
import { Line } from "react-chartjs-2";
import { useSelector } from "react-redux";
import moment from "moment";
import collect from "collect.js";
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

  const sprintsCollection = useMemo(() => sprints.sortBy("week"), [sprints]);

  const tagsCollection = useMemo(() => collect(asanaTags), [asanaTags]);

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
            completedAt: completedAtCollection
              .where("storyPoints")
              .sum("storyPoints")
          };
          const count = {
            createdAt: createdAtCollection.count(),
            completedAt: completedAtCollection.count()
          };

          return {
            storyPoints: {
              ...storyPoints,
              delta: storyPoints.createdAt - storyPoints.completedAt
            },
            count: {
              ...count,
              delta: count.createdAt - count.completedAt
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

  const backlogCountPerSprintByTag = useMemo(
    () =>
      tags
        .map(tag => ({ tag, data: getBacklogCountPerSprint(tag) }))
        .map(({ data, ...obj }) => ({
          ...obj,
          countPerDay: data.pluck(weight || "count").pluck("runningTotal")
        }))
        .filter(({ countPerDay }) => countPerDay.isNotEmpty())
        .filter(({ countPerDay }) => !!countPerDay.sum()),
    [tags, getBacklogCountPerSprint, weight]
  );

  const data = useMemo(
    () => ({
      labels: sprintsCollection.pluck("number").toArray(),
      datasets: backlogCountPerSprintByTag
        .map(({ tag, countPerDay }) => ({
          label: tag,
          data: countPerDay.toArray(),
          borderColor:
            tag === ALL_TAGS_TAG
              ? randomFlatColors("blue")
              : getColourFromTag(tagsCollection.firstWhere("name", tag.tag)),
          pointRadius: 0,
          hidden: tag !== ALL_TAGS_TAG && !displayTags.includes(tag),
          fill: false
        }))
        .toArray()
    }),
    [backlogCountPerSprintByTag, tagsCollection, displayTags, sprintsCollection]
  );

  const options = useMemo(
    () => ({
      showLines: true,
      maintainAspectRatio: false,
      responsive: true,
      scales: {
        yAxes: [
          {
            type: "linear",
            display: true,
            position: "left",
            ticks: { beginAtZero: true, precision: 0 }
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

  if (getBacklogCountPerSprint(ALL_TAGS_TAG).isEmpty()) {
    return <div className="loading-spinner centre" />;
  }

  return (
    <div
      className="w-100 overflow-hidden"
      style={{ minHeight: "300px", height: "50vh" }}
    >
      <Line data={data} options={options} legend={legend} />
    </div>
  );
};

export default withBacklogTasks(withSprints(BacklogProgressPerSprint));
