import React, { useState, useEffect, useMemo } from "react";
import { withRouter } from "react-router-dom";
import { Range } from "rc-slider";
import randomFlatColors from "random-flat-colors";

const SprintFilter = ({ defaultCount, sprints, setSprints, history }) => {
  const { location } = history;

  const recentSprints = useMemo(() => {
    const count = parseInt(
      new URLSearchParams(location.search).get("count"),
      10
    );

    return sprints.take(count || defaultCount || 20).reverse();
  }, [location.search, sprints, defaultCount]);

  const sprintNumbers = useMemo(() => recentSprints.pluck("number").sort(), [
    recentSprints
  ]);

  const [sprintRange, setSprintRange] = useState([0, 0]);
  const [minSprint, maxSprint] = useMemo(() => [0, sprintNumbers.count() - 1], [
    sprintNumbers
  ]);

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
    setSprints(
      recentSprints.slice(
        sprintRangeForDisplay[0],
        sprintRangeForDisplay[1] - sprintRangeForDisplay[0] + 1
      )
    );
  }, [setSprints, recentSprints, sprintRangeForDisplay]);

  const marks = useMemo(
    () =>
      sprintNumbers
        .map((number, index) => ({ [index]: number }))
        .reduce(
          (accumulator, currentValue) => ({
            ...currentValue,
            ...accumulator
          }),
          {}
        ),
    [sprintNumbers]
  );

  const colors = {
    track: randomFlatColors("blue"),
    handle: randomFlatColors("white"),
    rail: randomFlatColors("gray")
  };

  return (
    <div className="pl-4 pr-4 pb-4" style={{ overflowX: "hidden" }}>
      <Range
        defaultValue={sprintRangeForDisplay}
        value={sprintRangeForDisplay}
        min={minSprint}
        max={maxSprint}
        onChange={setSprintRange}
        pushable
        marks={marks}
        trackStyle={[{ backgroundColor: colors.track }]}
        handleStyle={[
          { backgroundColor: colors.handle },
          { backgroundColor: colors.handle }
        ]}
        railStyle={{ backgroundColor: colors.rail }}
      />
    </div>
  );
};

export default withRouter(SprintFilter);
