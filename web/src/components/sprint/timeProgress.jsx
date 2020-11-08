import React, { useMemo } from "react";
import { ProgressBar } from "react-bootstrap";
import moment from "moment";
import collect from "collect.js";

const SprintTimeProgress = ({ className = "", sprint, sm }) => {
  const { state, startOn, finishedOn, sprintLength } = sprint;

  const isComplete = useMemo(() => state === "COMPLETED", [state]);

  const timeProgress = useMemo(() => {
    if (isComplete) {
      return 100;
    }
    return (moment().diff(startOn, "hours") / (sprintLength * 24)) * 100;
  }, [startOn, sprintLength, isComplete]);

  return (
    <ProgressBar className={className}>
      <ProgressBar
        animated
        now={timeProgress}
        label={
          (timeProgress >= 50 || !sm) && `ends ${finishedOn.from(moment())}`
        }
      />
      <ProgressBar
        animated
        now={100 - timeProgress}
        variant="info"
        label={
          (timeProgress < 50 || !sm) && `ends ${finishedOn.from(moment())}`
        }
      />
    </ProgressBar>
  );
};

export default SprintTimeProgress;
