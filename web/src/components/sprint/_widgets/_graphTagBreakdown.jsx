import React, { useMemo } from "react";
import { Chart } from "react-charts";
import collect from "collect.js";

const GraphStoryPointsTrend = ({ sprints }) => {
  const sprintsCollection = useMemo(() => collect(sprints), [sprints]);

  const data = useMemo(() => {
    return sprintsCollection
      .sortBy("number")
      .flatMap(sprint => sprint.tasks)
      .flatMap(task => task.tags)
      .unique()
      .map(key => ({
        label: key,
        data: sprintsCollection
          .map(sprint => [
            sprint.number,
            collect(sprint.tasks)
              .flatMap(task => task.tags)
              .where(null, key)
              .count()
          ])
          .all()
      }))
      .all();
  }, [sprintsCollection]);

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
        show: sprintsCollection.count() > 1
      },
      {
        position: "left",
        type: "linear",
        stacked: sprintsCollection.count() > 1,
        hardMin: 0
      }
    ],
    [sprintsCollection]
  );

  return <Chart data={data} series={series} axes={axes} tooltip dark />;
};

export default GraphStoryPointsTrend;
