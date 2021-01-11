import React, { useMemo } from "react";
import { Row, Col, Badge } from "react-bootstrap";
import collect from "collect.js";
import Color from "color";
import Table from "../../library/table";

const SprintDistributionCustomField = ({ sprint, customFieldName }) => {
  const safeCustomFieldName = customFieldName || "Client";

  const { tasks, state: sprintState } = sprint || {};

  const isForecastSprint = useMemo(() => sprintState === "FORECAST", [
    sprintState
  ]);

  const sprintStoryPoints = useMemo(
    () => (isForecastSprint ? sprint.storyPoints : sprint.completedStoryPoints),
    [isForecastSprint, sprint.storyPoints, sprint.completedStoryPoints]
  );

  const tasksCollection = useMemo(
    () =>
      collect(tasks)
        .when(!isForecastSprint, collection => collection.where("completedAt"))
        .filter(obj => obj.storyPoints || obj.tags)
        .map(({ storyPoints, customFields }) => ({
          storyPoints: storyPoints || 0,
          customField: collect(customFields).firstWhere(
            "name",
            safeCustomFieldName
          )
        }))
        .where("customField"),
    [tasks, safeCustomFieldName, isForecastSprint]
  );

  const storyPointsByCustomField = useMemo(
    () =>
      tasksCollection
        .groupBy("customField.value.name")
        .map((value, key) => ({
          key,
          count: value.count(),
          storyPoints: value.sum("storyPoints"),
          colour: value.first().customField.value.color
        }))
        .pipe(collection => collect(collection.toArray()))
        .map(row => ({
          ...row,
          percentage: Math.round(
            (row.storyPoints / parseFloat(sprintStoryPoints)) * 100
          )
        }))
        .pipe(collection =>
          collection.count() < 2
            ? collection
            : collection.push({
                key: "",
                storyPoints: collection.sum("storyPoints"),
                percentage: collection.sum("percentage")
              })
        ),
    [tasksCollection, sprintStoryPoints]
  );

  const TableRow = ({ data }) => {
    const { key, count, storyPoints, percentage, colour } = data;

    const backgroundColor = (colour || "white").split("-")[0];

    return (
      <Row as="tr" key={key} className="m-0">
        <Col as="td" xs={3} className="text-left align-middle">
          <Badge
            className={
              Color(backgroundColor).isLight() ? "text-dark" : "text-light"
            }
            style={{ backgroundColor }}
          >
            {key}
          </Badge>
        </Col>
        <Col as="td" xs={3} className="text-right align-middle">
          {count}
        </Col>
        <Col as="td" xs={3} className="text-right align-middle">
          {storyPoints}
        </Col>
        <Col as="td" xs={3} className="text-right align-middle">
          {percentage}%
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
            <Col as="th" xs={3} className="text-left text-capitalize">
              {safeCustomFieldName}
            </Col>
            <Col as="th" xs={3}>
              Tasks
            </Col>
            <Col as="th" xs={3}>
              Story Points
            </Col>
            <Col as="th" xs={3}>
              Percentage
            </Col>
          </Row>
        </thead>
      )}
    />
  );
};

export default SprintDistributionCustomField;
