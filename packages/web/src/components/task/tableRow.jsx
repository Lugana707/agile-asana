import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQuestion, faCheck } from "@fortawesome/free-solid-svg-icons";
import collect from "collect.js";
import moment from "moment";
import TagBadge from "./badges/tag";
import CustomFieldBadge from "./badges/customField";
import UserBadge from "../userBadge";

const TaskTableRow = ({ data: task }) => {
  const {
    uuid,
    name,
    dueOn,
    storyPoints,
    tags,
    customFields,
    assignee,
    completedAt
  } = task;

  const sortedTags = useMemo(() => collect(tags).sort(), [tags]);

  const sortedCustomFields = useMemo(
    () =>
      collect(customFields)
        .sortBy("name")
        .pluck("value"),
    [customFields]
  );

  const variant = useMemo(() => {
    if (dueOn) {
      const now = moment();
      if (dueOn.isBefore(now.add(7, "days"))) {
        return "danger";
      } else if (dueOn.isBefore(now.add(14, "days"))) {
        return "warning";
      }
    }
    return "";
  }, [dueOn]);

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
          style={{ textDecoration: !!completedAt && "line-through" }}
          variant="link"
        >
          {name}
        </Link>
        {sortedCustomFields.dump().map(obj => (
          <CustomFieldBadge key={obj.name} customField={obj} />
        ))}
        {sortedTags.map((tag, index) => (
          <TagBadge key={index} tag={tag} />
        ))}
      </td>
      {assignee && (
        <td className="align-middle col-3 d-none d-md-block">
          <UserBadge user={assignee} />
        </td>
      )}
      <td className="align-middle text-right text-nowrap col-2 d-none d-md-block">
        {!!completedAt ? (
          <FontAwesomeIcon
            className="text-success mr-1"
            icon={faCheck}
            size="2x"
          />
        ) : (
          dueOn && <span className={`text-${variant}`}>{dueOn.fromNow()}</span>
        )}
      </td>
    </tr>
  );
};

export default TaskTableRow;
