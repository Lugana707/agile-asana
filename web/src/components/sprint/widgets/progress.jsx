import React from "react";
import { LinkContainer } from "react-router-bootstrap";
import { Card } from "react-bootstrap";
import SprintTimeProgress from "../timeProgress";
import SprintStoryPointProgress from "../storyPointProgress";
import withCurrentSprint from "../withCurrentSprint";

const TasksAtRiskCardAndTable = ({ currentSprint }) => {
  const { uuid, number } = currentSprint;

  return (
    <LinkContainer to={`/sprint/${uuid}`} className="btn p-0">
      <Card bg="secondary" text="light" className="text-left h-100">
        <Card.Body className="p-3">
          <Card.Title className="m-0">
            <div className="pb-1">Sprint {number}</div>
            <SprintStoryPointProgress sprint={currentSprint} sm />
            <SprintTimeProgress className="mt-1" sprint={currentSprint} sm />
          </Card.Title>
        </Card.Body>
      </Card>
    </LinkContainer>
  );
};

export default withCurrentSprint(TasksAtRiskCardAndTable);
