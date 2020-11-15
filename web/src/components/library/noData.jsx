import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSkull } from "@fortawesome/free-solid-svg-icons";

export default ({ noDataText = "Nothing to show!" }) => {
  return (
    <h2 className="text-center">
      <FontAwesomeIcon icon={faSkull} size="1x" />
      <span className="pl-2">{noDataText}</span>
    </h2>
  );
};
