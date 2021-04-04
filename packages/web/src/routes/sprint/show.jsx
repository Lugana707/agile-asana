import React from "react";
import { withRouter } from "react-router-dom";
import withSprintFromURL from "../../components/sprint/withSprintFromURL";

const Sprint = ({ history, sprint }) => {
  const { uuid, isCurrentSprint } = sprint;

  if (isCurrentSprint) {
    history.push(`/sprint/${uuid}/dashboard`);
  } else {
    history.push(`/sprint/${uuid}/report`);
  }

  return <div>Redirecting...</div>;
};

export default withSprintFromURL(withRouter(Sprint));
