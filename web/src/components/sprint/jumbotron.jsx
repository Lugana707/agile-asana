import React from "react";
import { withRouter } from "react-router-dom";
import {
  Jumbotron,
  Container,
  ToggleButtonGroup,
  ToggleButton
} from "react-bootstrap";
import collect from "collect.js";

const SprintJumobtron = ({ sprint, title, children, location, history }) => {
  const { pathname } = location;

  const { number, uuid } = sprint;

  const links = collect([
    { title: "Home", url: "" },
    { title: "Tasks", url: "task" },
    { title: "Report", url: "report" }
  ])
    .map(({ url, ...obj }) => ({
      ...obj,
      url: `/sprint/${uuid}/${url}`
    }))
    .map(obj => ({ ...obj, disabled: pathname === obj.url }));

  return (
    <Jumbotron fluid className="bg-primary">
      <Container>
        <h1>
          <span>Sprint {number}</span>
          {title && (
            <>
              <span className="text-muted"> | </span>
              <span>{title}</span>
            </>
          )}
        </h1>
        <hr />
        <ToggleButtonGroup
          as="p"
          name="sprintPageRadio"
          size="sm"
          type="radio"
          value={pathname}
          onChange={url => history.push(url)}
        >
          {links.map(({ title, url, disabled }, index) => (
            <ToggleButton
              key={index}
              value={url}
              variant="dark"
              checked={url === pathname}
            >
              {title}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
        {children && <p>{children}</p>}
      </Container>
    </Jumbotron>
  );
};

export default withRouter(SprintJumobtron);
