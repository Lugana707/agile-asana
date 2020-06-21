import React, { useMemo } from "react";
import { Button, Container, Row, Col } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";

const Show = ({ match }) => {
  const { projectGid } = match.params;
  const projectGidMemo = useMemo(() => decodeURIComponent(projectGid), [
    projectGid
  ]);

  return (
    <Container>
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
