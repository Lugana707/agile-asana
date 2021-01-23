import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Row, Col, Card, Dropdown } from "react-bootstrap";
import collect from "collect.js";
import Table from "../library/table";
import TaskTableRow from "../task/tableRow";
import SprintDistributionCustomField from "./tables/distributionCustomField";

const SprintCard = ({
  title,
  sprint,
  variant,
  children,
  defaultView,
  noChangeView,
  customFieldName,
  tags: displayTags,
  ...props
}) => {
  const {
    uuid,
    tasks,
    number,
    completedAt,
    finishedOn,
    isForecastSprint,
    isCurrentSprint,
    isCompletedSprint
  } = sprint;

  const [view, setView] = useState(defaultView || "tasks");

  const storyPoints = useMemo(
    () =>
      collect(tasks)
        .pluck("storyPoints")
        .where()
        .sum(),
    [tasks]
  );

  const determineVariants = variant => {
    switch (variant) {
      case "danger":
        return { card: "danger", table: "dark", subtitle: "warning" };
      case "warning":
        return { card: "warning", table: "dark", subtitle: "dark" };
      default:
        return { card: "dark", subtitle: "muted" };
    }
  };
  const variants = determineVariants(variant);

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

  const filteredTasks = useMemo(
    () =>
      collect(tasks).when(displayTags && displayTags.isNotEmpty(), collection =>
        collection.filter(task =>
          displayTags.whereIn(true, task.tags).isNotEmpty()
        )
      ),
    [tasks, displayTags]
  );

  const CurrentViewDropdown = () => {
    switch (view) {
      case "tasks":
        return (
          <>
            {!!storyPoints && <div>{storyPoints} story points</div>}
            <span>{sprint.tasks.length} tasks</span>
          </>
        );
      default:
        return <span className="text-capitalize">{!noChangeView && view}</span>;
    }
  };

  const CurrentView = () => {
    switch (view) {
      case "tasks":
        return (
          <Table
            className="mb-0"
            data={filteredTasks.toArray()}
            row={TaskTableRow}
            variant={variants.table}
          />
        );
      case "distribution":
        return (
          <SprintDistributionCustomField
            sprint={sprint}
            customFieldName={customFieldName}
          />
        );
      default:
        return <div />;
    }
  };

  return (
    <Card
      bg={variants.card}
      text="light"
      className="text-left h-100 w-100 mb-2 border-0 overflow-hidden"
    >
      <Row>
        <Col
          key={uuid}
          xs={12}
          md={4}
          lg={3}
          className="pr-1"
          style={{ maxWidth: "285px" }}
        >
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
                </>
              </ConditionalSprintLink>
              <div className="clearfix" />
            </Card.Title>
            <Card.Subtitle className="text-nowrap">
              {noChangeView ? (
                <div className={`text-${variants.subtitle}`}>
                  <CurrentViewDropdown />
                </div>
              ) : (
                <Dropdown className={`btn-link text-${variants.subtitle}`}>
                  <Dropdown.Toggle as="span">
                    <CurrentViewDropdown />
                  </Dropdown.Toggle>
                  <Dropdown.Menu className="text-capitalize">
                    {collect(["tasks", "distribution"])
                      .sort()
                      .map(obj => (
                        <Dropdown.Item
                          key={obj}
                          onClick={() => setView(obj)}
                          disabled={obj === view}
                        >
                          {obj}
                        </Dropdown.Item>
                      ))}
                  </Dropdown.Menu>
                </Dropdown>
              )}
            </Card.Subtitle>
          </Card.Body>
        </Col>
        <Col className="pl-1 bg-dark">
          <CurrentView />
        </Col>
      </Row>
    </Card>
  );
};

export default SprintCard;
