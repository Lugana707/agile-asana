import React, { useMemo } from "react";
import { Row, Col, Badge } from "react-bootstrap";
import collect from "collect.js";
import Color from "color";
import Table from "../../library/table";

const SprintDistributionCustomField = ({ sprint, customFieldName }) => {
  const safeCustomFieldName = customFieldName || "Client";

  const { state: sprintState } = sprint || {};

  const isCompletedSprint = useMemo(() => sprintState === "COMPLETED", [
    sprintState
  ]);
  const isForecastSprint = useMemo(() => sprintState === "FORECAST", [
    sprintState
  ]);

  const tasks = useMemo(
    () => collect(isCompletedSprint ? sprint.completedTasks : sprint.tasks),
    [isCompletedSprint, sprint.tasks, sprint.completedTasks]
  );

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
        .map(({ count, storyPoints, ...row }) => ({
          ...row,
          count: {
            sum: count,
            percentage: Math.round((count / parseFloat(tasks.count())) * 100)
          },
          storyPoints: {
            sum: storyPoints,
            percentage: Math.round(
              (storyPoints / parseFloat(sprintStoryPoints)) * 100
            )
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
    const { key, count, storyPoints, colour } = data;

    const backgroundColor = (colour || "white").split("-")[0];

    return (
      <Row as="tr" key={key} className="m-0">
        <Col as="td" xs={4} className="text-left align-middle">
          <Badge
            className={
              Color(backgroundColor).isLight() ? "text-dark" : "text-light"
            }
            style={{ backgroundColor }}
          >
            {key}
          </Badge>
        </Col>
        <Col as="td" xs={2} className="text-right align-middle">
          {count.sum}
        </Col>
        <Col as="td" xs={2} className="text-right align-middle">
          {count.percentage}%
        </Col>
        <Col as="td" xs={2} className="text-right align-middle">
          {storyPoints.sum}
        </Col>
        <Col as="td" xs={2} className="text-right align-middle">
          {storyPoints.percentage}%
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
              {safeCustomFieldName}
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
