import React, { useState, useEffect, useMemo } from "react";
import { withRouter } from "react-router-dom";
import { Range } from "rc-slider";

const SprintFilter = ({ sprints, setSprints, history }) => {
  const { location } = history;

  const recentSprints = useMemo(() => {
    const count = parseInt(
      new URLSearchParams(location.search).get("count"),
      10
    );

    return sprints.take(count || 20).reverse();
  }, [location.search, sprints]);

  const sprintNumbers = useMemo(() => recentSprints.pluck("number").sort(), [
    recentSprints
  ]);

  const [sprintRange, setSprintRange] = useState([0, 0]);
  const [minSprint, maxSprint] = useMemo(
    () => [sprintNumbers.min(), sprintNumbers.max()],
    [sprintNumbers]
  );

  useEffect(() => {
    const lastSprint = sprintNumbers.last() || {};
    const lastCompletedSprint =
      maxSprint - (lastSprint.state === "COMPLETED" ? 0 : 1);
    setSprintRange([lastCompletedSprint - 6, lastCompletedSprint]);
  }, [sprintNumbers, maxSprint]);

  useEffect(() => {
    setSprints(recentSprints.whereBetween("number", sprintRange));
  }, [setSprints, recentSprints, sprintRange]);

  const marks = useMemo(
    () =>
      sprintNumbers.reduce(
        (accumulator, currentValue) => ({
          [currentValue]: currentValue,
          ...accumulator
        }),
        {}
      ),
    [sprintNumbers]
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

export default withRouter(SprintFilter);
