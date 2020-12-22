import React from "react";
import { Col, Card } from "react-bootstrap";
import Table from "../../library/table";
import SprintTaskTableRow from "./sprintTaskTableRow";

const determineVariants = variant => {
  if (variant === "danger") {
    return { card: "danger", table: "dark", subtitle: "warning" };
  }

  return { card: "dark", subtitle: "muted" };
};

const SprintCardAndTable = ({ title, sprint, variant, showSprintCard }) => {
  const { tasks, number, storyPoints, completedAt } = sprint;

  const variants = determineVariants(variant);

  return (
    <>
      {showSprintCard && (
        <Col key={number} xs={3} className="pr-1">
          <Card bg={variants.card} text="light" className="text-left h-100">
            <Card.Body>
              <Card.Title>
                <h1 className="float-right text-info">{number}</h1>
                <span>{title || completedAt.format("YYYY-MM-DD")}</span>
              </Card.Title>
              {!!storyPoints && (
                <Card.Subtitle className={`text-${variants.subtitle}`}>
                  <span className="text-nowrap">
                    {storyPoints} story points
                  </span>
                </Card.Subtitle>
              )}
            </Card.Body>
          </Card>
        </Col>
      )}
      <Col className="pl-1">
        <Table
          className="mt-1 mb-1"
          data={tasks}
          row={SprintTaskTableRow}
          variant={variants.table}
        />
      </Col>
    </>
  );
};

export default SprintCardAndTable;
