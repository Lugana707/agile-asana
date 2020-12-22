import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faQuestion,
  faExternalLinkAlt
} from "@fortawesome/free-solid-svg-icons";
import collect from "collect.js";
import moment from "moment";
import TagBadge from "./tags/badge";

const SprintTaskTableRow = ({ data }) => {
  const { gid, name, dueOn, storyPoints, sprints, tags } = data;

  const [sprintUUID] = sprints;
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
    <tr key={gid} className="d-flex pr-1">
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
        <span className="text-left d-block">
          <span>{name}</span>
        </span>
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
      <td className="align-middle col-1">
        <a
          href={`https://app.asana.com/0/${sprintUUID}/${gid}/f`}
          rel="noopener noreferrer"
          target="_blank"
          className="btn btn-secondary"
        >
          <FontAwesomeIcon icon={faExternalLinkAlt} />
        </a>
      </td>
    </tr>
  );
};

export default SprintTaskTableRow;
