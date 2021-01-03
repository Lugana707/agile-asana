import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { Col, Card } from "react-bootstrap";
import collect from "collect.js";
import Table from "../../library/table";
import TaskTableRow from "../../task/tableRow";

const SprintCardAndTable = ({
  title,
  sprint,
  variant,
  showSprintCard,
  tags: displayTags
}) => {
  const { uuid, tasks, number, completedAt, finishedOn, state } = sprint;

  const storyPoints = useMemo(() => collect(tasks).sum("storyPoints"), [tasks]);

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

  const isCurrentSprint = useMemo(() => state === "ACTIVE", [state]);
  const isCompletedSprint = useMemo(() => state === "COMPLETED", [state]);

  const stateVariant = useMemo(
    () =>
      (isCurrentSprint && "success") ||
      (isCompletedSprint && "warning") ||
      "info",
    [isCurrentSprint, isCompletedSprint]
  );

  const ConditionalSprintLink = ({ children }) => {
    if (!!uuid) {
      return <Link to={`/sprint/${uuid}`}>{children}</Link>;
    }

    return <div className="w-100">{children}</div>;
  };

  return (
    <>
      {showSprintCard && (
        <Col key={number} xs={12} md={3} className="pr-1">
          <Card bg={variants.card} text="light" className="text-left h-100">
            <Card.Body>
              <Card.Title>
                <ConditionalSprintLink>
                  <>
                    <h1 className={`text-${stateVariant} float-right`}>
                      {number}
                    </h1>
                    <span className="text-light">
                      {title ||
                        (finishedOn && finishedOn.format("YYYY-MM-DD")) ||
                        (completedAt && completedAt.format("YYYY-MM-DD"))}
                    </span>
                    {(isCurrentSprint || isCompletedSprint) && (
                      <small className={`d-block text-${stateVariant} mt-1`}>
                        {isCurrentSprint && "(In Progress)"}
                        {isCompletedSprint && "Completed"}
                      </small>
                    )}
                    <div className="clearfix" />
                  </>
                </ConditionalSprintLink>
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
          row={TaskTableRow}
          variant={variants.table}
        />
      </Col>
    </>
  );
};

export default SprintCardAndTable;
