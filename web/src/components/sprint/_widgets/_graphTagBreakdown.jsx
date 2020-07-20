import React, { useMemo, useCallback } from "react";
import { Chart } from "react-charts";
import collect from "collect.js";

const GraphStoryPointsTrend = ({ sprints }) => {
  const sprintTasks = useMemo(() => sprints || [], [sprints]);

  const data = useMemo(() => {
    const sprintTasksCollection = collect(sprintTasks).sortBy("week");
    return sprintTasksCollection
      .flatMap(sprint => sprint.tasks)
      .flatMap(task => task.tags)
      .groupBy("name")
      .keys()
      .map(key => ({
        label: key,
        data: sprintTasksCollection
          .map(sprint => [
            sprint.week,
            collect(sprint.tasks)
              .flatMap(task => task.tags)
              .where("name", key)
              .count()
          ])
          .all()
      }))
      .all();
  }, [sprintTasks]);

  const series = useCallback(
    (series, index) => ({
      type: "bar"
    }),
    []
  );
  const axes = useMemo(
    () => [
      { primary: true, type: "ordinal", position: "bottom" },
      {
        position: "left",
        type: "linear",
        stacked: sprintTasks.length > 1,
        hardMin: 0
      }
    ],
    [sprintTasks]
  );

  return <Chart data={data} series={series} axes={axes} tooltip dark />;
};

export default GraphStoryPointsTrend;
