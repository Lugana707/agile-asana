import React from "react";
import { Badge } from "react-bootstrap";
import Color from "color";

export default ({ colour, children, ...props }) => {
  const textColour = Color(colour).isLight() ? "text-dark" : "text-light";

  return (
    <Badge
      className={`${textColour} mr-1 mb-1`}
      style={{ backgroundColor: colour, borderColor: colour }}
      {...props}
    >
      {children}
    </Badge>
  );
};
