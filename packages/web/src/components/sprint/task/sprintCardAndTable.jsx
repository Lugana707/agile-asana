import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { Row, Col, Card } from "react-bootstrap";
import collect from "collect.js";
import Table from "../../library/table";
import TaskTableRow from "../../task/tableRow";

const SprintCardAndTable = ({
  title,
  sprint,
  variant,
  showSprintCard,
  tags: displayTags,
  ...props
}) => {
  const { uuid, tasks, number, completedAt, finishedOn, state } = sprint;

  const storyPoints = useMemo(
    () =>
      collect(tasks)
        .pluck("storyPoints")
        .where()
        .sum(),
    [tasks]
  );

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

  const SprintNumber = props => {
    const sprintNumber = number.toString();

    if (number.props || sprintNumber.length < 4) {
      return <h1 {...props}>{number}</h1>;
    }

    const small = sprintNumber.slice(0, sprintNumber.length - 2);
    const big = sprintNumber.slice(sprintNumber.length - 2);

    return (
      <span {...props}>
        <span>{small}</span>
        <h1>{big}</h1>
      </span>
    );
  };

  const TaskTable = () => (
    <Col className="pl-1">
      <Table
        className="mb-0"
        data={filteredTasks}
        row={TaskTableRow}
        variant={variants.table}
      />
    </Col>
  );

  if (showSprintCard) {
    return (
      <Card
        bg={variants.card}
        text="light"
        className="text-left h-100 w-100 mb-2 border-0 overflow-hidden"
      >
        <Row>
          {showSprintCard && (
            <Col key={uuid} xs={12} md={3} className="pr-1">
              <Card.Body>
                <Card.Title>
                  <ConditionalSprintLink>
                    <>
                      <SprintNumber
                        className={`text-${stateVariant} float-right`}
                      />
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
            </Col>
          )}
          <TaskTable />
        </Row>
      </Card>
    );
  }

  return <TaskTable />;
};

export default SprintCardAndTable;
