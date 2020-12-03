import React, { useState, useEffect, useMemo } from "react";
import { Range } from "rc-slider";
import collect from "collect.js";

const SprintFilter = ({ sprints, setSprints }) => {
  const sprintCollection = useMemo(
    () =>
      collect(sprints)
        .pluck("number")
        .sort(),
    [sprints]
  );

  const [minSprint, maxSprint] = useMemo(
    () => [sprintCollection.min(), sprintCollection.max()],
    [sprintCollection]
  );
  const [sprintRange, setSprintRange] = useState([0, 0]);

  useEffect(() => {
    const lastSprint = sprintCollection.last() || {};
    const lastCompletedSprint =
      maxSprint - (lastSprint.state === "COMPLETED" ? 0 : 1);
    setSprintRange([lastCompletedSprint - 6, lastCompletedSprint]);
  }, [sprintCollection, maxSprint]);

  useEffect(() => {
    setSprints(
      collect(sprints)
        .whereBetween("number", sprintRange)
        .all()
    );
  }, [setSprints, sprints, sprintRange]);

  const marks = useMemo(
    () =>
      sprintCollection.reduce(
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

export default SprintFilter;
