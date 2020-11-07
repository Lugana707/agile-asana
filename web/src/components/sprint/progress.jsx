import React, { useMemo } from "react";
import { ProgressBar } from "react-bootstrap";
import moment from "moment";
import collect from "collect.js";

const SprintProgress = ({ sprint, sm, showIfComplete = false }) => {
  const {
    uuid,
    state,
    startOn,
    finishedOn,
    tasks,
    sprintLength,
    storyPoints,
    completedStoryPoints
  } = sprint;

  const isComplete = useMemo(() => state === "COMPLETED", [state]);

  const timeProgress = useMemo(() => {
    if (isComplete) {
      return 100;
    }
    return (moment().diff(startOn, "hours") / (sprintLength * 24)) * 100;
  }, [startOn, sprintLength, isComplete]);

  const inProgressStoryPoints = useMemo(
    () =>
      collect(tasks)
        .where("storyPoints")
        .filter(
          ({ completedAt, mostRecentSprint }) =>
            !completedAt || mostRecentSprint !== uuid
        )
        .filter(({ sections }) =>
          collect(sections)
            .map(section => section.toLowerCase())
            .where()
            .filter(section => section !== "to do" && section !== "refined")
            .isNotEmpty()
        )
        .sum("storyPoints"),
    [tasks, uuid]
  );

  const remainingStoryPoints = useMemo(
    () => storyPoints - inProgressStoryPoints - completedStoryPoints,
    [storyPoints, inProgressStoryPoints, completedStoryPoints]
  );

  if (isComplete && !showIfComplete) {
    return <div />;
  }

  const showStoryPointLabel = storyPoints =>
    !sm ||
    collect([
      completedStoryPoints,
      inProgressStoryPoints,
      remainingStoryPoints
    ]).max() === storyPoints;

  return (
    <>
      <ProgressBar>
        <ProgressBar
          striped
          now={(completedStoryPoints / storyPoints) * 100}
          variant="success"
          key={1}
          label={
            showStoryPointLabel(completedStoryPoints) &&
            `${completedStoryPoints} story points`
          }
        />
        <ProgressBar
          striped
          now={(inProgressStoryPoints / storyPoints) * 100}
          variant="warning"
          key={2}
          label={
            showStoryPointLabel(inProgressStoryPoints) && (
              <span className="text-dark">
                {inProgressStoryPoints} story points
              </span>
            )
          }
        />
        <ProgressBar
          striped
          now={(remainingStoryPoints / storyPoints) * 100}
          variant="danger"
          key={3}
          label={
            showStoryPointLabel(remainingStoryPoints) &&
            `${remainingStoryPoints} story points`
          }
        />
      </ProgressBar>
      {!isComplete && (
        <ProgressBar className="mt-1">
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
      )}
    </>
  );
};

export default SprintProgress;
