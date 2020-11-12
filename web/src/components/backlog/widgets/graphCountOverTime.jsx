import React, { useMemo, useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Chart } from "react-charts";
import moment from "moment";
import camelcase from "camelcase";
import collect from "collect.js";
import withAsanaClient from "../../withAsanaClient";

const GraphCountOverTime = ({ asanaClient }) => {
  const { asanaProjects } = useSelector(state => state.asanaProjects);

  const { gid: backlogGid } = useMemo(
    () => collect(asanaProjects).firstWhere("name", "Product Backlog"),
    [asanaProjects]
  );

  const [tasks, setTasks] = useState(false);

  const loadTasks = useCallback(async () => {
    if (!asanaClient || !backlogGid) {
      return false;
    }

    const collection = await asanaClient.tasks.getTasksForProject(backlogGid, {
      opt_fields: ["created_at", "completed_at", "custom_fields"].join(",")
    });
    const tasks = await collection.fetch();

    setTasks(
      collect(tasks).map(
        ({ created_at, completed_at, custom_fields, ...task }) => ({
          ...task,
          createdAt: moment(created_at),
          completedAt: moment(completed_at),
          ...custom_fields.reduce(
            (accumulator, { name, number_value, enum_value }) => ({
              [camelcase(name)]: number_value || enum_value,
              ...accumulator
            }),
            {}
          )
        })
      )
    );
  }, [asanaClient, backlogGid]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const backlogCountPerDay = useMemo(() => {
    if (!tasks) {
      return collect();
    }

    const minDate = moment.unix(
      tasks
        .pluck("createdAt")
        .map(date => date.unix())
        .sort()
        .first()
    );
    const days = moment().diff(minDate, "days");

    const getTaskCountByDate = key =>
      tasks
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

    const createdCountByDate = getTaskCountByDate("createdAt");
    const completedCountByDate = getTaskCountByDate("completedAt");

    return collect(new Array(days).fill())
      .map((day, index) =>
        moment(minDate)
          .add(index, "days")
          .format("YYYY-MM-DD")
      )
      .map((date, index, self) => {
        const { count: createdCount = 0, storyPoints: createdStoryPoints = 0 } =
          createdCountByDate[date] || {};
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
      .dump()
      .filter(({ date }) => moment(date).isAfter(moment().add(-1, "year")));
  }, [tasks]);

  const data = useMemo(
    () => [
      {
        label: "Tasks",
        data: backlogCountPerDay.map(({ date, count }) => [date, count]).all(),
        secondaryAxisID: "taskCount"
      },
      {
        label: "Story Points",
        data: backlogCountPerDay
          .map(({ date, storyPoints }) => [date, storyPoints])
          .all(),
        secondaryAxisID: "storyPointSum"
      }
    ],
    [backlogCountPerDay]
  );

  const series = useCallback((series, index) => {
    return { showPoints: false, type: "line", position: "bottom" };
  }, []);

  const axes = useMemo(
    () => [
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
      {
        id: "taskCount",
        position: "left",
        type: "linear",
        hardMin: 0,
        stacked: false
      },
      {
        id: "storyPointSum",
        position: "right",
        type: "linear",
        hardMin: 0,
        stacked: false
      }
    ],
    []
  );

  if (!tasks) {
    return <div className="loading-spinner centre" />;
  }

  return <Chart data={data} series={series} axes={axes} tooltip dark />;
};

export default withAsanaClient(GraphCountOverTime);
