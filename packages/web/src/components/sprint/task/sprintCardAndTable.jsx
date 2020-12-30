import React, { useMemo } from "react";
import { Col, Card } from "react-bootstrap";
import collect from "collect.js";
import Table from "../../library/table";
import SprintTaskTableRow from "./sprintTaskTableRow";

const SprintCardAndTable = ({
  title,
  sprint,
  variant,
  showSprintCard,
  tags: displayTags
}) => {
  const { tasks, number, storyPoints, completedAt } = sprint;

  const determineVariants = variant => {
    if (variant === "danger") {
      return { card: "danger", table: "dark", subtitle: "warning" };
    }

    return { card: "dark", subtitle: "muted" };
  };
  const variants = determineVariants(variant);

  const filteredTasks = useMemo(
    () =>
      displayTags
        ? collect(tasks)
            .when(displayTags.isNotEmpty(), collection =>
              collection.filter(task =>
                displayTags.whereIn(true, task.tags).isNotEmpty()
              )
            )
            .toArray()
        : tasks,
    [tasks, displayTags]
  );

  return (
    <>
      {showSprintCard && (
        <Col key={number} xs={12} md={3} className="pr-1">
          <Card bg={variants.card} text="light" className="text-left h-100">
            <Card.Body>
              <Card.Title>
                <h1 className="text-info float-right">{number}</h1>
                <span>{title || completedAt.format("YYYY-MM-DD")}</span>
                <div className="clearfix" />
              </Card.Title>
              <Card.Subtitle
                className={`text-${variants.subtitle} text-nowrap`}
              >
                {!!storyPoints && <div>{storyPoints} story points</div>}
                <div>{sprint.tasks.length} tasks</div>
              </Card.Subtitle>
            </Card.Body>
          </Card>
        </Col>
      )}
      <Col className="pl-1">
        <Table
          className="mt-1 mb-1"
          data={filteredTasks}
          row={SprintTaskTableRow}
          variant={variants.table}
        />
      </Col>
    </>
  );
};

export default SprintCardAndTable;
