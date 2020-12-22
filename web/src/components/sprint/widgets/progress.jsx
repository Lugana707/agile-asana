import React from "react";
import Widget from "../../library/widget";
import SprintTimeProgress from "../timeProgress";
import SprintStoryPointProgress from "../storyPointProgress";
import withCurrentSprint from "../withCurrentSprint";

const TasksAtRiskCardAndTable = ({ currentSprint }) => {
  if (!currentSprint) {
    return <div />;
  }

  const { uuid, number } = currentSprint;

  return (
    <Widget to={`/sprint/${uuid}`} bg="secondary" text="light">
      <div className="pb-1">Sprint {number}</div>
      <SprintStoryPointProgress sprint={currentSprint} sm />
      <SprintTimeProgress className="mt-1" sprint={currentSprint} />
    </Widget>
  );
};

export default withCurrentSprint(TasksAtRiskCardAndTable);
