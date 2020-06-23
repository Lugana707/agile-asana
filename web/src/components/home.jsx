import React from "react";
import { Button, Container, Row, Col } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import logo from "../logo.svg";

const Home = () => {
  return (
    <Container hidden>
      <Row>
        <Col>
          <img src={logo} className="App-logo" alt="logo" />
        </Col>
      </Row>
      <Row>
        <Col className="text-center">
          <LinkContainer to="/project" className="m-1">
            <Button variant="primary">Projects</Button>
          </LinkContainer>
        </Col>
      </Row>
    </Container>
  );
};

export default Home;
