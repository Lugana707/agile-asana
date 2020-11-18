import React, { useMemo } from "react";
import { Badge, ListGroup } from "react-bootstrap";
import { useSelector } from "react-redux";
import collect from "collect.js";
import { getColourFromTag } from "../../../scripts/helpers/asanaColours";

export default ({ className, tag, children }) => {
  const { asanaTags } = useSelector(state => state.asanaTags);

  const colour = useMemo(
    () => getColourFromTag(collect(asanaTags).firstWhere("name", tag)),
    [asanaTags, tag]
  );

  return (
    <Badge
      key={tag}
      className={`mr-1 text-light ${className}`}
      style={{ backgroundColor: colour, borderColor: colour }}
    >
      {children || tag}
    </Badge>
  );
};
