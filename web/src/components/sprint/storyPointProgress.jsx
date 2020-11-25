import React, { useMemo } from "react";
import { ProgressBar } from "react-bootstrap";
import collect from "collect.js";

const SprintStoryPointProgress = ({ className = "", sprint, sm }) => {
  const { uuid, tasks, storyPoints, completedStoryPoints } = sprint;

  const inProgressStoryPoints = useMemo(
    () =>
      collect(tasks)
        .where("mostRecentSprint")
        .where("storyPoints", uuid)
        .filter(({ sections }) =>
          collect(sections)
            .map(section => section.toLowerCase())
            .where()
            .filter(section => section !== "to do" && section !== "refined")
            .isNotEmpty()
        )
        .sum("storyPoints"),
    [tasks]
  );

  const remainingStoryPoints = useMemo(
    () => storyPoints - inProgressStoryPoints - completedStoryPoints,
    [storyPoints, inProgressStoryPoints, completedStoryPoints]
  );

  const showStoryPointLabel = storyPoints =>
    !sm ||
    collect([
      completedStoryPoints,
      inProgressStoryPoints,
      remainingStoryPoints
    ]).max() === storyPoints;

  return (
    <ProgressBar className={className}>
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
  );
};

export default SprintStoryPointProgress;
