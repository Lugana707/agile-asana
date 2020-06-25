import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import ProjectWidgetGraphStoryPointsTrend from "./project/_widgets/_graphStoryPointsTrend";
import ProjectWidgetGraphStoryPointsThroughWeek from "./project/_widgets/_graphStoryPointsThroughWeek";

const Home = () => {
  return (
    <Container className="">
      <Row>
        <Col xs="12" style={{ height: "40vw" }}>
          <ProjectWidgetGraphStoryPointsTrend />
        </Col>
        <Col xs="12" style={{ height: "40vw" }}>
          <ProjectWidgetGraphStoryPointsThroughWeek />
        </Col>
      </Row>
    </Container>
  );
};

export default Home;
