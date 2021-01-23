import React, { useState, useMemo } from "react";
import { Row, Col, OverlayTrigger, Tooltip, Dropdown } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import collect from "collect.js";
import Table from "../../library/table";
import CustomFieldBadge from "../../task/badges/customField";

const SprintDistributionCustomField = ({ sprint, customFieldName }) => {
  const { isCompletedSprint, isCurrentSprint } = sprint || {};

  const tasks = useMemo(
    () => collect(isCompletedSprint ? sprint.tasksCompleted : sprint.tasks),
    [isCompletedSprint, sprint.tasks, sprint.tasksCompleted]
  );

  const sprintStoryPoints = useMemo(
    () =>
      isCompletedSprint ? sprint.completedStoryPoints : sprint.storyPoints,
    [isCompletedSprint, sprint.storyPoints, sprint.completedStoryPoints]
  );

  const customFieldNames = useMemo(
    () =>
      tasks
        .pluck("customFields")
        .flatten(1)
        .pluck("name")
        .unique()
        .sort(),
    [tasks]
  );

  const [currentCustomFieldName, setCurrentCustomFieldName] = useState(
    customFieldName || customFieldNames.first()
  );

  collect({ customFieldName, currentCustomFieldName }).dump();

  const tasksCollection = useMemo(
    () =>
      tasks
        .when(isCompletedSprint, collection => collection.where("completedAt"))
        .filter(obj => obj.storyPoints || obj.tags)
        .map(({ storyPoints, customFields }) => ({
          storyPoints: storyPoints || 0,
          customField: collect(customFields).firstWhere(
            "name",
            currentCustomFieldName
          )
        }))
        .where("customField"),
    [tasks, currentCustomFieldName, isCompletedSprint]
  );

  const InProgressSprintTooltipWrapper = ({ children }) => {
    if (!isCurrentSprint) {
      return children;
    }

    const InProgressSprintTooltip = props => (
      <Tooltip {...props}>
        calculated using this sprint's commitments, not what has been completed
      </Tooltip>
    );

    return (
      <OverlayTrigger
        placement="right"
        delay={{ show: 250, hide: 400 }}
        overlay={InProgressSprintTooltip}
      >
        <span>
          <span className="mr-1">{children}</span>
          <FontAwesomeIcon icon={faInfoCircle} />
        </span>
      </OverlayTrigger>
    );
  };

  const CustomFieldTitle = ({ children }) => {
    if (!!customFieldName) {
      return children;
    }

    return (
      <Dropdown className={`btn-link text-light text-nowrap`}>
        <Dropdown.Toggle as="span">{children}</Dropdown.Toggle>
        <Dropdown.Menu className="text-capitalize">
          {customFieldNames.map(obj => (
            <Dropdown.Item
              key={obj}
              onClick={() => setCurrentCustomFieldName(obj)}
              disabled={obj === currentCustomFieldName}
            >
              {obj}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>
    );
  };

  const storyPointsByCustomField = useMemo(
    () =>
      tasksCollection
        .groupBy("customField.value.name")
        .map((value, key) => ({
          ...value.first().customField.value,
          key,
          count: value.count(),
          storyPoints: value.sum("storyPoints")
        }))
        .pipe(collection => collect(collection.toArray()))
        .map(({ count, storyPoints, ...row }) => ({
          ...row,
          count: {
            sum: count,
            percentage: count / parseFloat(tasks.count()) || 0
          },
          storyPoints: {
            sum: storyPoints,
            percentage: storyPoints / parseFloat(sprintStoryPoints) || 0
          }
        }))
        .pipe(collection =>
          collection.count() < 2
            ? collection
            : collection.push({
                key: "",
                count: {
                  sum: collection.pluck("count.sum").sum(),
                  percentage: collection.pluck("count.percentage").sum()
                },
                storyPoints: {
                  sum: collection.pluck("storyPoints.sum").sum(),
                  percentage: collection.pluck("storyPoints.percentage").sum()
                }
              })
        ),
    [tasksCollection, sprintStoryPoints, tasks]
  );

  const TableRow = ({ data }) => {
    const { key, count, storyPoints } = data;

    const className = `${
      isCurrentSprint ? "font-italic" : ""
    } text-right align-middle`;

    return (
      <Row as="tr" key={key} className="m-0">
        <Col as="td" xs={4} className="text-left align-middle">
          <CustomFieldBadge customField={data} />
        </Col>
        <Col as="td" xs={2} className={className}>
          {count.sum}
        </Col>
        <Col as="td" xs={2} className={className}>
          {Math.round(count.percentage * 100)}%
        </Col>
        <Col as="td" xs={2} className={className}>
          {storyPoints.sum}
        </Col>
        <Col as="td" xs={2} className={className}>
          {Math.round(storyPoints.percentage * 100)}%
        </Col>
      </Row>
    );
  };

  if (!sprint) {
    return <div className="loading-spinner centre" />;
  }

  return (
    <Table
      id="sprints"
      loading={!sprint}
      data={storyPointsByCustomField.toArray()}
      row={TableRow}
      className="text-right"
      tableHeader={() => (
        <thead>
          <Row as="tr" className="m-0">
            <Col as="th" xs={4} className="text-left text-capitalize">
              <CustomFieldTitle>
                <InProgressSprintTooltipWrapper>
                  {currentCustomFieldName}
                </InProgressSprintTooltipWrapper>
              </CustomFieldTitle>
            </Col>
            <Col as="th" xs={2}>
              Tasks
            </Col>
            <Col as="th" xs={2}>
              %
            </Col>
            <Col as="th" xs={2}>
              Story Points
            </Col>
            <Col as="th" xs={2}>
              %
            </Col>
          </Row>
        </thead>
      )}
    />
  );
};

export default SprintDistributionCustomField;
