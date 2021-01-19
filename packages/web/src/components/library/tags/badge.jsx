import React, { useMemo } from "react";
import { Badge } from "react-bootstrap";
import { useSelector } from "react-redux";
import collect from "collect.js";

export default ({ className, tag, children }) => {
  const { data: tags } = useSelector(state => state.tags);

  const colour = useMemo(() => collect(tags).firstWhere("name", tag).color, [
    tags,
    tag
  ]);

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
