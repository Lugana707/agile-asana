import React, { useMemo } from "react";
import { Badge } from "react-bootstrap";
import { useSelector } from "react-redux";
import collect from "collect.js";

export default ({ className, tag, children }) => {
  const { asanaTags } = useSelector(state => state.asanaTags);

  const colour = useMemo(
    () => collect(asanaTags).firstWhere("name", tag).color,
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
