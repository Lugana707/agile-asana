import React, { useState, useMemo, useCallback, useReducer } from "react";
import { Chart } from "react-charts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimesCircle,
  faCheckCircle
} from "@fortawesome/free-solid-svg-icons";
import { ButtonGroup, Button } from "react-bootstrap";
import moment from "moment";
import collect from "collect.js";
import withBacklogTasks from "../withBacklogTasks";

const allTagsTag = "All Tags";

const GraphCountOverTime = ({ backlogTasks }) => {
  backlogTasks.macro("filterToCurrentYear", function() {
    return this.filter(({ date }) =>
      moment(date).isAfter(moment().add(-0.5, "years"))
    );
  });

  const [showTaskCount, setShowTaskCount] = useState(true);
  const [showStoryPoints, setShowStoryPoints] = useState(true);
  const [showTags, setShowTags] = useState(false);

  const minDate = useMemo(
    () =>
      moment.unix(
        backlogTasks
          .pluck("createdAt")
          .map(date => date.unix())
          .sort()
          .first()
      ),
    [backlogTasks]
  );

  const backlogCountPerDay = useCallback(
    tag => {
      if (backlogTasks.isEmpty()) {
        return collect();
      }

      const filteredBacklogTasks = backlogTasks.when(
        tag !== allTagsTag,
        collection => collection.filter(task => task.tags.includes(tag))
      );

      const days = moment().diff(minDate, "days");

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

      return collect(new Array(days).fill())
        .map((day, index) =>
          moment(minDate)
            .add(index, "days")
            .format("YYYY-MM-DD")
        )
        .map((date, index, self) => {
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
        .filterToCurrentYear();
    },
    [backlogTasks, minDate]
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
        .push(allTagsTag)
        .reverse(),
    [backlogTasks]
  );

  const [tagsEnabled, toggleTag] = useReducer(
    (accumulator, currentValue) => ({
      ...accumulator,
      [currentValue]: !accumulator[currentValue]
    }),
    tags.reduce(
      (accumulator, currentValue) => ({
        ...accumulator,
        [currentValue]: false,
        [allTagsTag]: true
      }),
      {}
    )
  );

  const backlogCountPerDayByTag = useMemo(
    () =>
      tags
        .filter(tag => !!tagsEnabled[tag])
        .map(tag => ({ tag, countPerDay: backlogCountPerDay(tag) }))
        .filter(({ countPerDay }) => countPerDay.isNotEmpty()),
    [tags, tagsEnabled, backlogCountPerDay]
  );

  const data = useMemo(() => {
    return [
      ...backlogCountPerDayByTag
        .when(!showTaskCount, () => collect([]))
        .map(({ tag, countPerDay }) => ({
          label: `${tag} (Tasks)`,
          data: countPerDay.map(({ date, count }) => [date, count]).all(),
          secondaryAxisID: "taskCount"
        }))
        .toArray(),
      ...backlogCountPerDayByTag
        .when(!showStoryPoints, () => collect([]))
        .map(({ tag, countPerDay }) => ({
          label: `${tag} (Story Points)`,
          data: countPerDay
            .map(({ date, storyPoints }) => [date, storyPoints])
            .all(),
          secondaryAxisID: "storyPointSum"
        }))
        .toArray()
    ].filter(Boolean);
  }, [showTaskCount, showStoryPoints, backlogCountPerDayByTag]);

  const series = useCallback((series, index) => {
    return { showPoints: false, type: "line", position: "bottom" };
  }, []);

  const axes = useMemo(
    () =>
      [
        {
          primary: true,
          type: "ordinal",
          position: "bottom",
          format: d => {
            const date = moment(d);
            if (date.get("date") === 1) {
              return date.format("MMM YYYY");
            }
            return false;
          }
        },
        showTaskCount && {
          id: "taskCount",
          position: "left",
          type: "linear",
          hardMin: 0,
          stacked: false
        },
        showStoryPoints && {
          id: "storyPointSum",
          position: "right",
          type: "linear",
          hardMin: 0,
          stacked: false
        },
        !showTaskCount &&
          !showStoryPoints && { position: "left", type: "linear" }
      ].filter(Boolean),
    [showTaskCount, showStoryPoints]
  );

  const seriesStyle = useCallback(() => ({ transition: "all .5s ease" }), []);
  const datumStyle = useCallback(() => ({ transition: "all .5s ease" }), []);

  const FilterButtons = useCallback(
    () => (
      <>
        <ButtonGroup size="sm">
          {[
            {
              label: "Task Count",
              action: setShowTaskCount,
              value: showTaskCount
            },
            {
              label: "Story Points",
              action: setShowStoryPoints,
              value: showStoryPoints
            },
            {
              label: "Show Tags",
              action: setShowTags,
              value: showTags
            }
          ].map(({ label, action, value }) => (
            <Button
              variant={value ? "secondary" : "dark"}
              onClick={() => action(!value)}
            >
              <FontAwesomeIcon icon={value ? faCheckCircle : faTimesCircle} />
              <span className="ml-1">{label}</span>
            </Button>
          ))}
        </ButtonGroup>
        {showTags && (
          <>
            <hr />
            {tags.map(key => (
              <Button
                key={key}
                size="sm"
                variant={tagsEnabled[key] ? "info" : "link"}
                onClick={() => toggleTag(key)}
              >
                {key}
              </Button>
            ))}
          </>
        )}
      </>
    ),
    [showTaskCount, showStoryPoints, showTags, tags, tagsEnabled]
  );

  const BacklogChart = useCallback(
    () => (
      <Chart
        data={data}
        series={series}
        axes={axes}
        seriesStyle={seriesStyle}
        datumStyle={datumStyle}
        tooltip
        dark
      />
    ),
    [data, series, axes, seriesStyle, datumStyle]
  );

  if (backlogCountPerDay().isEmpty()) {
    return <div className="loading-spinner centre" />;
  }

  return (
    <div className="h-100">
      <FilterButtons />
      <div className="h-100 overflow-hidden">
        <BacklogChart />
      </div>
    </div>
  );
};

export default withBacklogTasks(GraphCountOverTime);
