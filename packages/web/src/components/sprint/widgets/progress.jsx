import React from "react";
import Widget from "../../library/widget";
import SprintTimeProgress from "../timeProgress";
import SprintStoryPointProgress from "../storyPointProgress";
import withCurrentSprint from "../withCurrentSprint";

const SprintWidgetProgress = ({ currentSprints }) =>
  currentSprints.map(currentSprint => (
    <Widget to={`/sprint/${currentSprint.uuid}`} bg="primary" text="dark">
      <div className="pb-1">{currentSprint.name}</div>
      <SprintStoryPointProgress sprint={currentSprint} sm />
      <SprintTimeProgress className="mt-1" sprint={currentSprint} />
    </Widget>
  ));

export default withCurrentSprint(SprintWidgetProgress);
