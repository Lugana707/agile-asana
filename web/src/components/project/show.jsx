import React, { useMemo } from "react";
import { Button, Container, Row, Col } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { useSelector } from "react-redux";
import ProjectWidgetGraphStoryPointsThroughWeek from "../project/_widgets/_graphStoryPointsThroughWeek";

const Show = ({ match }) => {
  const { projectGid } = match.params;
  const projectGidMemo = useMemo(() => decodeURIComponent(projectGid), [
    projectGid
  ]);

  const { asanaProjectTasks } = useSelector(state => state.asanaProjectTasks);

  const sprintsMemo = useMemo(
    () => (asanaProjectTasks || []).filter(({ gid }) => gid === projectGidMemo),
    [asanaProjectTasks, projectGidMemo]
  );

  return (
    <Container>
      <Row>
        <Col xs="12" style={{ height: "60vh" }}>
          <ProjectWidgetGraphStoryPointsThroughWeek sprints={sprintsMemo} />
        </Col>
      </Row>
      <hr />
      <Row>
        <Col>
          <LinkContainer to={`/project/${projectGidMemo}/task`}>
            <Button>Tasks</Button>
          </LinkContainer>
        </Col>
      </Row>
    </Container>
  );
};

export default Show;
