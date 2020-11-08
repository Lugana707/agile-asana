import React, { useMemo } from "react";
import { ProgressBar } from "react-bootstrap";
import moment from "moment";
import collect from "collect.js";

const SprintTimeProgress = ({ className = "", sprint }) => {
  const { state, startOn, finishedOn, sprintLength } = sprint;

  const isComplete = useMemo(() => state === "COMPLETED", [state]);

  const timeProgress = useMemo(() => {
    if (isComplete) {
      return 100;
    }

    const sprintLengthWithoutWeekends = sprintLength - 2;

    const weekendHours =
      collect()
        .times(moment().diff(startOn, "days") + 1, number => number - 1)
        .map(number => moment().add(number, "days"))
        .map(date => date.weekday())
        .whereIn(true, [6, 0])
        .count() * 24;

    return (
      ((moment().diff(startOn, "hours") - weekendHours) /
        (sprintLengthWithoutWeekends * 24)) *
      100
    );
  }, [startOn, sprintLength, isComplete]);

  return (
    <ProgressBar className={className}>
      <ProgressBar
        animated
        now={timeProgress}
        label={timeProgress >= 50 && `ends ${finishedOn.from(moment())}`}
      />
      <ProgressBar
        animated
        now={100 - timeProgress}
        variant="info"
        label={timeProgress < 50 && `ends ${finishedOn.from(moment())}`}
      />
    </ProgressBar>
  );
};

export default SprintTimeProgress;
