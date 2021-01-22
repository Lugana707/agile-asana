import React, { useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { Card, Table, Row, Col } from "react-bootstrap";
import { useSelector } from "react-redux";
import { selectTasks } from "../../scripts/redux/selectors/tasks";
import collect from "collect.js";
import { findBestMatch } from "string-similarity";
import TaskTableRow from "./tableRow";

const SimilarTaskList = ({ task, count = 6 }) => {
  const tasks = useSelector(selectTasks);

  const stringifyTask = useCallback(({ uuid, ...obj }) => {
    return JSON.stringify(
      collect(obj)
        .only(["name", "description", "tags", "weight", "customFields"])
        .pipe(({ customFields, ...obj }) => ({
          ...obj,
          customFields: collect(customFields).reduce(
            (accumulator, { name, value }) => ({
              ...accumulator,
              [name]: value.name
            }),
            {}
          )
        }))
    );
  }, []);

  const stringifiedTask = useMemo(() => stringifyTask(task), [
    task,
    stringifyTask
  ]);

  const stringifiedTasks = useMemo(
    () =>
      tasks
        .where("uuid", "!==", task.uuid)
        .where("weight")
        .map(({ ...obj }) => ({
          task: obj,
          stringifiedTask: stringifyTask(obj)
        })),
    [task.uuid, tasks, stringifyTask]
  );

  const sortedTasks = useMemo(
    () =>
      stringifiedTasks
        .pipe(collection =>
          collect(
            findBestMatch(
              stringifiedTask,
              collection.pluck("stringifiedTask").toArray()
            ).ratings
          )
        )
        .pluck("rating")
        .map((rating, index) => ({
          rating,
          task: stringifiedTasks.get(index).task
        }))
        .sortByDesc("rating")
        .take(count),
    [stringifiedTask, stringifiedTasks, count]
  );

  return (
    <div className="rounded overflow-hidden">
      {sortedTasks.map(obj => (
        <Card key={obj.uuid} bg="dark" text="light">
          <Row>
            <Col xs={12} md={3} lg={2} className="pr-md-0">
              <Card.Body className="h-100">
                <Link to={`/task/${obj.task.uuid}`}>
                  <Card.Title className="h-100 d-flex justify-content-center align-items-center">
                    <h1 className="position-absolute">
                      {Math.round(obj.rating * 100)}%
                    </h1>
                  </Card.Title>
                </Link>
              </Card.Body>
            </Col>
            <Col className="pl-md-0">
              <Table striped variant="dark" borderless className="mb-0">
                <tbody>
                  <TaskTableRow data={obj.task} />
                </tbody>
              </Table>
            </Col>
          </Row>
        </Card>
      ))}
    </div>
  );
};

export default SimilarTaskList;
