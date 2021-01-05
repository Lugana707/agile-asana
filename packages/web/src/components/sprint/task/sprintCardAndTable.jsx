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
  const isForecastSprint = useMemo(() => state === "FORECAST", [state]);

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

  const SprintNumber = () => {
    const sprintNumber = number.toString();

    if (sprintNumber.length < 4) {
      return <h1>{number}</h1>;
    }

    const small = sprintNumber.slice(0, sprintNumber.length - 2);
    const big = sprintNumber.slice(sprintNumber.length - 2);

    return (
      <>
        <span>{small}</span>
        <h1>{big}</h1>
      </>
    );
  };

  return (
    <>
      {showSprintCard && (
        <Col key={uuid} xs={12} md={3} className="pr-1">
          <Card bg={variants.card} text="light" className="text-left h-100">
            <Card.Body>
              <Card.Title>
                <ConditionalSprintLink>
                  <>
                    <span className={`text-${stateVariant} float-right`}>
                      <SprintNumber />
                    </span>
                    <span className="text-light">
                      {title ||
                        (finishedOn && finishedOn.format("YYYY-MM-DD")) ||
                        (completedAt && completedAt.format("YYYY-MM-DD"))}
                    </span>
                    <small className={`d-block text-${stateVariant} mt-1`}>
                      {isCurrentSprint && "(In Progress)"}
                      {isCompletedSprint && "Completed"}
                      {isForecastSprint && "Forecast"}
                    </small>
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
