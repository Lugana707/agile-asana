import React from "react";
import { Link } from "react-router-dom";
import { Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQuestion } from "@fortawesome/free-solid-svg-icons";
import collect from "collect.js";
import moment from "moment";
import TagBadge from "../library/tags/badge";
import UserBadge from "../userBadge";

const TaskTableRow = ({ data }) => {
  const { uuid, name, dueOn, storyPoints, tags, assignee } = data;

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
      <td className="align-middle col">
        <Link
          to={`/task/${uuid}`}
          as={Button}
          className="text-left d-block text-light p-0"
          variant="link"
        >
          {name}
        </Link>
        {sortedTags.isNotEmpty() && (
          <span className="ml-1">
            {sortedTags.map((tag, index) => (
              <TagBadge key={index} tag={tag} />
            ))}
          </span>
        )}
      </td>
      {assignee && (
        <td className="align-middle col-3 d-none d-md-block">
          <UserBadge user={assignee} />
        </td>
      )}
      <td
        className={`align-middle text-${variant} text-right text-nowrap col-2 d-none d-md-block`}
      >
        {dueOn && dueOn.fromNow()}
      </td>
    </tr>
  );
};

export default TaskTableRow;
