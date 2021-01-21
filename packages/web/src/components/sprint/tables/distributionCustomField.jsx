import React, { useMemo } from "react";
import { Row, Col } from "react-bootstrap";
import collect from "collect.js";
import Table from "../../library/table";
import CustomFieldBadge from "../../task/badges/customField";

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
    () => collect(isCompletedSprint ? sprint.tasksCompleted : sprint.tasks),
    [isCompletedSprint, sprint.tasks, sprint.tasksCompleted]
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

    return (
      <Row as="tr" key={key} className="m-0">
        <Col as="td" xs={4} className="text-left align-middle">
          <CustomFieldBadge customField={data} />
        </Col>
        <Col as="td" xs={2} className="text-right align-middle">
          {count.sum}
        </Col>
        <Col as="td" xs={2} className="text-right align-middle">
          {Math.round(count.percentage * 100)}%
        </Col>
        <Col as="td" xs={2} className="text-right align-middle">
          {storyPoints.sum}
        </Col>
        <Col as="td" xs={2} className="text-right align-middle">
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
