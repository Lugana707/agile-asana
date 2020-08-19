import React from "react";
import { Col, Card } from "react-bootstrap";
import moment from "moment";
import Table from "./_table";
import SprintTaskTableRow from "./_sprintTaskTableRow";

const SprintCardAndTable = ({ title, sprint, variant }) => {
  const { tasks, number, storyPoints, finishedOn } = sprint;

  return (
    <>
      <Col key={number} xs={3} className="pr-1">
        <Card bg={variant || "dark"} text="light" className="text-left h-100">
          <Card.Body>
            <Card.Title>
              <h1 className="float-right text-info">{number}</h1>
              <span>{title || moment(finishedOn).format("YYYY-MM-DD")}</span>
            </Card.Title>
            {!!storyPoints && (
              <Card.Subtitle className="text-muted">
                <span className="text-nowrap">{storyPoints} story points</span>
              </Card.Subtitle>
            )}
          </Card.Body>
        </Card>
      </Col>
      <Col className="pl-1">
        <Table
          className="mt-1 mb-1"
          data={tasks}
          row={SprintTaskTableRow}
          variant={variant}
        />
      </Col>
    </>
  );
};

export default SprintCardAndTable;
