import React, { useMemo } from "react";
import withIncompleteBacklogTasks from "../withIncompleteBacklogTasks";
import Widget from "../../library/widget";

const BacklogStoryPoints = ({ incompleteBacklogTasks }) => {
  const storyPoints = useMemo(
    () => incompleteBacklogTasks.where("storyPoints").sum("storyPoints"),
    [incompleteBacklogTasks]
  );

  return (
    <Widget to="/backlog/dashboard" bg="info" text="dark">
      <h1 className="text-nowrap d-inline">{storyPoints}</h1>
      <small className="d-block">Backlog Story Points</small>
    </Widget>
  );
};

export default withIncompleteBacklogTasks(BacklogStoryPoints);
