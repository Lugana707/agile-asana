import React, { useMemo } from "react";
import { Badge } from "react-bootstrap";
import { useSelector } from "react-redux";
import collect from "collect.js";

export default ({ className, tag, children }) => {
  const { tags: fullListOfTags } = useSelector(state => state.tags);

  const colour = useMemo(
    () => collect(fullListOfTags).firstWhere("name", tag).color,
    [fullListOfTags, tag]
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
