import React from "react";
import { Jumbotron, Container } from "react-bootstrap";

export default ({ sprint, title, children }) => {
  const { number } = sprint;

  return (
    <Jumbotron fluid className="bg-primary">
      <Container>
        <h1>
          <span>Sprint {number}</span>
          {title && <span> {title}</span>}
        </h1>
        {children}
      </Container>
    </Jumbotron>
  );
};
