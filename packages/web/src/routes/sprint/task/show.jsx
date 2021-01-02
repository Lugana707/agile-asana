import React from "react";
import withSprintFromURL from "../../../components/sprint/withSprintFromURL";
import SprintJumbotron from "../../../components/sprint/jumbotron";
import TaskSearchableList from "../../../components/task/searchableList";

const Tasks = ({ sprint }) => {
  if (!sprint) {
    return <div />;
  }

  return (
    <>
      <SprintJumbotron sprint={sprint} title="Tasks" />
      <TaskSearchableList sprint={sprint} />
    </>
  );
};

export default withSprintFromURL(Tasks);
