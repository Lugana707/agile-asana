import React from "react";
import Button from "react-bootstrap/Button";
import { LinkContainer } from "react-router-bootstrap";
import logo from "../logo.svg";

const Home = () => {
  return (
    <>
      <img src={logo} className="App-logo" alt="logo" />
      <p>
        Edit <code>src/App.js</code> and save to reload.
      </p>
      <LinkContainer to="/projects">
        <Button variant="primary">Projects</Button>
      </LinkContainer>
    </>
  );
};

export default Home;
