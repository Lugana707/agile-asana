import React, { useMemo } from "react";
import { Badge } from "react-bootstrap";
import { useSelector } from "react-redux";
import Color from "color";
import collect from "collect.js";

export default ({ className, tag, children }) => {
  const { data: tags } = useSelector(state => state.tags);

  const colour = useMemo(() => collect(tags).firstWhere("name", tag).color, [
    tags,
    tag
  ]);

  const textColour = Color(colour).isLight() ? "text-dark" : "text-light";

  return (
    <Badge
      key={tag}
      className={`${className || ""} ${textColour} mr-1`}
      style={{ backgroundColor: colour, borderColor: colour }}
    >
      {children || tag}
    </Badge>
  );
};
