import React from "react";
import { Button, Container, Row, Col } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import ProjectWidgetGraphStoryPoints from "./project/_widgets/_graphStoryPoints";

const Home = () => {
  return (
    <Container className="">
      <Row>
        <Col xs="6" style={{ "min-height": "30vw" }}>
          <ProjectWidgetGraphStoryPoints />
        </Col>
      </Row>
    </Container>
  );
};

export default Home;
