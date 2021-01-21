import React from "react";
import Color from "color";
import { Badge } from "react-bootstrap";

export default ({ className, customField }) => {
  const { name, color } = customField;

  const colour = (color || "white").split("-")[0];

  const textColour = Color(colour).isLight() ? "text-dark" : "text-light";

  return (
    <Badge
      className={`${className || ""} ${textColour} mr-1`}
      style={{ backgroundColor: colour, borderColor: colour }}
      pill
    >
      {name}
    </Badge>
  );
};
