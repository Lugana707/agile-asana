import React, { useMemo } from "react";
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

  const series = useMemo(
    () => ({
      type: "bar"
    }),
    []
  );
  const axes = useMemo(
    () => [
      {
        primary: true,
        type: "ordinal",
        position: "bottom",
        show: sprints.length > 1
      },
      {
        position: "left",
        type: "linear",
        stacked: sprintTasks.length > 1,
        hardMin: 0
      }
    ],
    [sprints.length, sprintTasks]
  );

  return <Chart data={data} series={series} axes={axes} tooltip dark />;
};

export default GraphStoryPointsTrend;
