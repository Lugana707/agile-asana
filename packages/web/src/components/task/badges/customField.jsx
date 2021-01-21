import React from "react";
import Color from "color";
import { Badge } from "react-bootstrap";

export default ({ customField }) => {
  const { key, colour } = customField;

  const backgroundColor = (colour || "white").split("-")[0];

  return (
    <Badge
      className={Color(backgroundColor).isLight() ? "text-dark" : "text-light"}
      style={{ backgroundColor }}
      pill
    >
      {key}
    </Badge>
  );
};
