import React, { useMemo } from "react";
import { Row, Col } from "react-bootstrap";
import { useSelector } from "react-redux";
import Table from "../_library/_table";

const Backlog = ({ forecastStoryPoints }) => {
  const { loading, refined } = useSelector(state => state.backlogTasks);
  const { asanaProjectTasks } = useSelector(state => state.asanaProjectTasks);

  const sprints = useMemo(() => asanaProjectTasks || [], [asanaProjectTasks]);
  const currentSprint = useMemo(() => sprints[0], [sprints]);

  const forecast = useMemo(() => {
    let index = 0;
    let totalStoryPoints = 0;
    return refined
      .filter(
        ({ projects }) =>
          !projects.map(({ gid }) => gid).includes(currentSprint.gid)
      )
      .reduce((accumulator, currentValue) => {
        const { storyPoints = 0 } = currentValue;
        totalStoryPoints = totalStoryPoints + storyPoints;

        if (totalStoryPoints >= forecastStoryPoints) {
          index = index + 1;
          totalStoryPoints = storyPoints;
        }

        let tasks = [...accumulator];
        tasks[index] = (accumulator[index] || []).concat([currentValue]);

        return tasks;
      }, []);
  }, [refined, forecastStoryPoints, currentSprint]);

  const TableRow = ({ data }) => {
    const { name, storyPoints } = data;
    return (
      <>
        <td className="align-middle">{name}</td>
        <td className="align-middle text-right">{storyPoints}</td>
      </>
    );
  };

  return (
    <>
      {forecast.map((tasks, index) => (
        <Row key={index}>
          <Col xs={8} className="text-left">
            <h2>Sprint {index + 1 + currentSprint.week}</h2>
          </Col>
          <Col xs={4} className="text-right">
            <span className="badge badge-info p-2">
              {tasks.reduce(
                (accumulator, { storyPoints = 0 }) => accumulator + storyPoints,
                0
              )}
            </span>
          </Col>
          <Col xs={12}>
            <hr />
            <Table
              id="backlog-forecast"
              loading={loading}
              data={tasks}
              row={TableRow}
              columns={false}
            />
          </Col>
        </Row>
      ))}
    </>
  );
};

export default Backlog;
