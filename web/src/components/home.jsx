import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import ProjectWidgetGraphStoryPoints from "./project/_widgets/_graphStoryPoints";

const Home = () => {
  return (
    <Container className="">
      <Row>
        <Col xs="12" style={{ height: "60vw" }}>
          <ProjectWidgetGraphStoryPoints />
        </Col>
      </Row>
    </Container>
  );
};

export default Home;
