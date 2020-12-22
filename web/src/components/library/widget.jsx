import React from "react";
import { Col } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { Card } from "react-bootstrap";

const Widget = ({ to, bg, text, children }) => {
  const ConditionalLinkContainer = ({ className, children }) => {
    if (to) {
      return (
        <LinkContainer to={to} className={className}>
          {children}
        </LinkContainer>
      );
    }

    return <div className={`w-100 ${className}`}>{children}</div>;
  };

  return (
    <Col xs={12} md={4} lg={3}>
      <ConditionalLinkContainer className="btn p-0">
        <Card bg={bg} text={text} className="text-left h-100">
          <Card.Body className="p-3">
            <Card.Title className="m-0">{children}</Card.Title>
          </Card.Body>
        </Card>
      </ConditionalLinkContainer>
    </Col>
  );
};

export default Widget;
