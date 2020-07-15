import React, { useState, useEffect, useMemo } from "react";
import { Range } from "rc-slider";
import collect from "collect.js";

const SprintFilters = ({ sprints, setSprints }) => {
  const sprintCollection = useMemo(() => collect(sprints), [sprints]);

  const [minSprint, maxSprint] = useMemo(
    () => [sprintCollection.min("week"), sprintCollection.max("week")],
    [sprintCollection]
  );
  const [sprintRange, setSprintRange] = useState([0, 0]);

  useEffect(() => {
    setSprintRange([maxSprint - 6, maxSprint]);
  }, [maxSprint]);

  useEffect(() => {
    setSprints(sprintCollection.whereBetween("week", sprintRange).all());
  }, [sprintCollection, sprintRange]);

  const filteredProjectTasks = useMemo(
    () => sprintCollection.whereBetween("week", sprintRange).all(),
    [sprintCollection, sprintRange]
  );

  const marks = useMemo(
    () =>
      sprintCollection.pluck("week").reduce(
        (accumulator, currentValue) => ({
          [currentValue]: currentValue,
          ...accumulator
        }),
        {}
      ),
    [sprintCollection]
  );

  return (
    <div className="pb-4">
      <Range
        defaultValue={[minSprint, maxSprint]}
        value={sprintRange}
        min={minSprint}
        max={maxSprint}
        onChange={setSprintRange}
        pushable
        marks={marks}
        trackStyle={[{ backgroundColor: "skyBlue" }]}
        handleStyle={[
          { backgroundColor: "white" },
          { backgroundColor: "white" }
        ]}
        railStyle={{ backgroundColor: "white" }}
      />
    </div>
  );
};

export default SprintFilters;
