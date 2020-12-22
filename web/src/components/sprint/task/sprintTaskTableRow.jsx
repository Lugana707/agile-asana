import React from "react";
import { Button } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQuestion } from "@fortawesome/free-solid-svg-icons";
import collect from "collect.js";
import moment from "moment";
import TagBadge from "../../library/tags/badge";

const SprintTaskTableRow = ({ data }) => {
  const { uuid, name, dueOn, storyPoints, tags } = data;

  const sortedTags = collect(tags).sort();

  const computeVariant = dueOn => {
    if (dueOn) {
      const now = moment();
      if (dueOn.isBefore(now.add(7, "days"))) {
        return "danger";
      } else if (dueOn.isBefore(now.add(14, "days"))) {
        return "warning";
      }
    }
    return "";
  };
  const variant = computeVariant(dueOn);

  return (
    <tr key={uuid} className="d-flex pr-1">
      <td className="align-middle text-center col-1">
        {storyPoints ? (
          storyPoints
        ) : (
          <FontAwesomeIcon
            className={`text-${variant || "warning"}`}
            icon={faQuestion}
          />
        )}
      </td>
      <td className="align-middle col" colSpan={dueOn ? 2 : 1}>
        <LinkContainer to={`/task/${uuid}`}>
          <Button className="text-left d-block text-light p-0" variant="link">
            {name}
          </Button>
        </LinkContainer>
        {sortedTags.isNotEmpty() && (
          <span className="ml-1">
            {sortedTags.map((tag, index) => (
              <TagBadge key={index} tag={tag} />
            ))}
          </span>
        )}
      </td>
      {dueOn && (
        <td className={`align-middle text-${variant} text-nowrap col-2`}>
          {dueOn.fromNow()}
        </td>
      )}
    </tr>
  );
};

export default SprintTaskTableRow;
