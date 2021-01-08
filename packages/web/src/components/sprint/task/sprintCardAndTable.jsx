import React, { useMemo } from "react";
import { Col } from "react-bootstrap";
import collect from "collect.js";
import Table from "../../library/table";
import TaskTableRow from "../../task/tableRow";
import SprintCard from "../sprintCard";

const SprintCardAndTable = ({
  title,
  sprint,
  variant,
  showSprintCard,
  tags: displayTags,
  ...props
}) => {
  const { tasks } = sprint;

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

  const TaskTable = () => (
    <Table
      className="mb-0"
      data={filteredTasks}
      row={TaskTableRow}
      variant={variants.table}
    />
  );

  if (showSprintCard) {
    return (
      <SprintCard title={title} sprint={sprint} variant={variant}>
        <TaskTable />
      </SprintCard>
    );
  }

  return (
    <Col className="pl-1 bg-dark">
      <TaskTable />
    </Col>
  );
};

export default SprintCardAndTable;
