import React from "react";
import Color from "color";
import { Badge } from "react-bootstrap";
import randomFlatColors from "random-flat-colors";

const getSafeColour = colour => {
  try {
    return Color(
      colour.toLowerCase() === "none"
        ? randomFlatColors()
        : (colour || randomFlatColors()).split("-")[0]
    );
  } catch {
    return Color(randomFlatColors());
  }
};

export default ({ className, customField }) => {
  const { name, color } = customField;

  const colour = getSafeColour(color);

  const textColour = colour.isLight() ? "text-dark" : "text-light";

  return (
    <Badge
      className={`${className || ""} ${textColour} mr-1`}
      style={{ backgroundColor: colour.hex(), borderColor: colour.hex() }}
      pill
    >
      {name}
    </Badge>
  );
};
