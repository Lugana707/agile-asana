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

  const sprintRangeForDisplay = useMemo(() => {
    const [min, max] = sprintRange;

    if (min || max) {
      return sprintRange;
    }

    const lastSprint = recentSprints.last() || {};
    const lastCompletedSprint =
      maxSprint - (lastSprint.state === "COMPLETED" ? 0 : 1);

    return [lastCompletedSprint - 6, lastCompletedSprint];
  }, [recentSprints, maxSprint, sprintRange]);

  useEffect(() => {
    setSprints(recentSprints.whereBetween("number", sprintRangeForDisplay));
  }, [setSprints, recentSprints, sprintRangeForDisplay]);

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
        defaultValue={sprintRangeForDisplay}
        value={sprintRangeForDisplay}
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
