import React, { useMemo, useCallback } from "react";
import { Line } from "react-chartjs-2";
import { useSelector } from "react-redux";
import moment from "moment";
import collect from "collect.js";
import randomFlatColors from "random-flat-colors";
import withBacklogTasks from "../withBacklogTasks";
import { getColourFromTag } from "../../../scripts/helpers/asanaColours";

const ALL_TAGS_TAG = "All";

const GraphCountOverTime = ({
  backlogTasks,
  tags: displayTags,
  weight = false
}) => {
  const { asanaTags } = useSelector(state => state.asanaTags);

  const tagsCollection = useMemo(() => collect(asanaTags), [asanaTags]);

  backlogTasks.macro("filterToCurrentYear", function() {
    return this.filter(({ date }) =>
      moment(date).isAfter(moment().add(-1, "years"))
    );
  });

  const dates = useMemo(() => {
    const minDate = moment.unix(
      backlogTasks
        .pluck("createdAt")
        .map(date => date.unix())
        .sort()
        .first()
    );

    const days = moment().diff(minDate, "days");

    if (!days) {
      return collect([]);
    }

    return collect(new Array(days).fill())
      .map((day, index) =>
        moment(minDate)
          .add(index, "days")
          .format("YYYY-MM-DD")
      )
      .map(date => ({ date }));
  }, [backlogTasks]);

  const backlogCountPerDay = useCallback(
    tag => {
      if (backlogTasks.isEmpty()) {
        return collect();
      }

      const filteredBacklogTasks = backlogTasks.when(
        tag !== ALL_TAGS_TAG,
        collection => collection.filter(task => task.tags.includes(tag))
      );

      const getTaskCountByDate = (collection, key) =>
        collection
          .where(key)
          .map(({ [key]: date, ...obj }) => ({
            ...obj,
            [key]: date.format("YYYY-MM-DD")
          }))
          .reduce(
            (accumulator, { [key]: date, storyPoints = 0 }) => ({
              ...accumulator,
              [date]: {
                storyPoints:
                  ((accumulator[date] || { storyPoints: 0 }).storyPoints || 0) +
                  storyPoints,
                count: (accumulator[date] || { count: 0 }).count + 1
              }
            }),
            {}
          );

      const createdCountByDate = getTaskCountByDate(
        filteredBacklogTasks,
        "createdAt"
      );
      const completedCountByDate = getTaskCountByDate(
        filteredBacklogTasks,
        "completedAt"
      );

      return dates
        .map(({ date }, index, self) => {
          const {
            count: createdCount = 0,
            storyPoints: createdStoryPoints = 0
          } = createdCountByDate[date] || {};
          const {
            count: completedCount = 0,
            storyPoints: completedStoryPoints = 0
          } = completedCountByDate[date] || {};

          const count = createdCount - completedCount;
          const storyPoints = createdStoryPoints - completedStoryPoints;

          return {
            date,
            storyPoints,
            count
          };
        })
        .map(({ count, storyPoints, ...obj }, index, self) => {
          const runningCountTotal =
            count +
            collect(self)
              .take(index)
              .sum("count");

          const runningStoryPointTotal =
            storyPoints +
            collect(self)
              .take(index)
              .sum("storyPoints");

          return {
            ...obj,
            storyPoints: runningStoryPointTotal,
            count: runningCountTotal
          };
        })
        .filterToCurrentYear()
        .except("date");
    },
    [dates, backlogTasks]
  );

  const tags = useMemo(
    () =>
      backlogTasks
        .filterToCurrentYear()
        .pluck("tags")
        .flatten(1)
        .unique()
        .sort()
        .reverse()
        .push(ALL_TAGS_TAG)
        .reverse(),
    [backlogTasks]
  );

  const backlogCountPerDayByTag = useMemo(
    () =>
      tags
        .map(tag => ({ tag, countPerDay: backlogCountPerDay(tag) }))
        .map(({ countPerDay, ...obj }) => ({
          ...obj,
          countPerDay: countPerDay.pluck(weight || "count")
        }))
        .filter(({ countPerDay }) => countPerDay.isNotEmpty())
        .filter(({ countPerDay }) => !!countPerDay.sum()),
    [tags, backlogCountPerDay, weight]
  );

  const data = useMemo(
    () => ({
      labels: dates
        .filterToCurrentYear()
        .pluck("date")
        .toArray(),
      datasets: backlogCountPerDayByTag
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
    [dates, backlogCountPerDayByTag, tagsCollection]
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

  if (backlogCountPerDay().isEmpty()) {
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

export default withBacklogTasks(GraphCountOverTime);
