import React, { useMemo } from "react";
import { Chart } from "react-charts";
import collect from "collect.js";

const GraphStoryPointsTrend = ({ sprints }) => {
  const sprintsCollection = useMemo(() => collect(sprints), [sprints]);

  const single = useMemo(() => sprintsCollection.count() === 1, [
    sprintsCollection
  ]);

  const data = useMemo(() => {
    return sprintsCollection
      .sortBy("number")
      .flatMap(sprint => sprint.tasks)
      .flatMap(task => task.tags)
      .unique()
      .when(single, collection =>
        collect([
          collection
            .map(key => {
              const count = collect(sprintsCollection.first().tasks)
                .flatMap(({ tags }) => tags)
                .where(null, key)
                .count();

              return {
                primary: key,
                secondary: count
              };
            })
            .dump()
            .toArray()
        ])
      )
      .when(!single, collection =>
        collection.map(key => ({
          label: key,
          data: sprintsCollection
            .map(({ number, tasks }) => {
              const taskTags = collect(tasks).flatMap(({ tags }) => tags);

              const count = taskTags.where(null, key).count();

              return [number, (count / parseFloat(taskTags.count())) * 100];
            })
            .all()
        }))
      )
      .all();
  }, [sprintsCollection, single]);

  const series = useMemo(
    () => ({
      type: single ? "bar" : "area"
    }),
    [single]
  );
  const axes = useMemo(
    () => [
      {
        primary: true,
        type: "ordinal",
        position: "bottom",
        show: true
      },
      {
        position: "left",
        type: "linear",
        stacked: !single,
        hardMin: 0,
        hardMax: !single && 100,
        format: d => (single ? d : `${Math.round(d)}%`),
        show: single
      }
    ],
    [single]
  );

  return (
    <Chart data={data} series={series} axes={axes} tooltip={!single} dark />
  );
};

export default GraphStoryPointsTrend;
