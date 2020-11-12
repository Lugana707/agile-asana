import React, { useMemo, useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Chart } from "react-charts";
import moment from "moment";
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
      opt_fields: ["created_at", "completed_at"].join(",")
    });
    const tasks = await collection.fetch();

    setTasks(
      collect(tasks).map(({ created_at, completed_at, ...task }) => ({
        ...task,
        createdAt: moment(created_at),
        completedAt: moment(completed_at)
      }))
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
        .pluck(key)
        .where()
        .map(date => date.format("YYYY-MM-DD"))
        .countBy()
        .all();

    const createdCountByDate = getTaskCountByDate("createdAt");
    const completedCountByDate = getTaskCountByDate("completedAt");

    return collect(new Array(days).fill())
      .map((day, index) =>
        moment(minDate)
          .add(index, "days")
          .format("YYYY-MM-DD")
      )
      .map((date, index, self) => {
        const { [date]: created = 0 } = createdCountByDate;
        const { [date]: completed = 0 } = completedCountByDate;

        const count = created - completed;

        return {
          date,
          count
        };
      })
      .map(({ count, ...obj }, index, self) => {
        const runningTotal =
          count +
          collect(self)
            .take(index)
            .sum("count");

        return {
          ...obj,
          count: runningTotal
        };
      })
      .filter(({ date }) => moment(date).isAfter(moment().add(-1, "year")))
      .dump();
  }, [tasks]);

  const data = useMemo(
    () => [
      {
        label: "Backlog size",
        data: backlogCountPerDay.map(({ date, count }) => [date, count]).all()
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
        position: "left",
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
