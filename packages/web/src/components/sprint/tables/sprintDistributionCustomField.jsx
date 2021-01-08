import React, { useMemo } from "react";
import collect from "collect.js";
import Table from "../../library/table";

const SprintDistributionCustomField = ({ sprint, customFieldName }) => {
  const safeCustomFieldName = customFieldName || "client";

  const { tasks, completedStoryPoints } = sprint || {};

  const tasksCollection = useMemo(
    () =>
      collect(tasks)
        .where("completedAt")
        .dump()
        .filter(obj => obj.storyPoints || obj.tags)
        .map(({ storyPoints, customFields }) => ({
          storyPoints: storyPoints || 0,
          customField: collect(customFields).firstWhere(
            "name",
            safeCustomFieldName
          )
        }))
        .where("customField"),
    [tasks, safeCustomFieldName]
  );

  const storyPointsByCustomField = useMemo(
    () =>
      tasksCollection
        .groupBy("customField.value.name")
        .map((value, key) => ({
          key,
          count: value.count(),
          storyPoints: value.sum("storyPoints")
        }))
        .pipe(collection => collect(collection.toArray()))
        .map(row => ({
          ...row,
          percentage: Math.round(
            (row.storyPoints / parseFloat(completedStoryPoints)) * 100
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
    [tasksCollection, completedStoryPoints]
  );

  const TableRow = ({ data }) => {
    const { key, count, storyPoints, percentage } = data;

    return (
      <tr key={key}>
        <td className="text-left align-middle">{key}</td>
        <td className="text-right align-middle">{count}</td>
        <td className="text-right align-middle">{storyPoints}</td>
        <td className="text-right align-middle">{percentage}%</td>
      </tr>
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
      columns={[
        <div className="text-left text-capitalize">{safeCustomFieldName}</div>,
        "Tasks",
        "Story Points",
        "Percentage"
      ]}
    />
  );
};

export default SprintDistributionCustomField;
