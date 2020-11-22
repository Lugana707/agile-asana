import React, { useMemo } from "react";
import { ListGroup } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { useSelector } from "react-redux";
import collect from "collect.js";
import { pluraliseText } from "../../../scripts/helpers";

export default ({ className, tag, count, children }) => {
  const { asanaTags } = useSelector(state => state.asanaTags);

  const colour = useMemo(
    () => collect(asanaTags).firstWhere("name", tag).color,
    [asanaTags, tag]
  );

  return (
    <LinkContainer
      key={tag}
      className={`text-nowrap text-light ${className}`}
      style={{ backgroundColor: colour, borderColor: colour }}
      to="/backlog/dashboard"
    >
      <ListGroup.Item>
        {children || (
          <>
            <span className="font-weight-bold">{count}</span>
            <span className="ml-3">{pluraliseText({ name: tag, count })}</span>
          </>
        )}
      </ListGroup.Item>
    </LinkContainer>
  );
};
