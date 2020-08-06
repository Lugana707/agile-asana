import React from "react";
import { Badge } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQuestion } from "@fortawesome/free-solid-svg-icons";
import collect from "collect.js";
import moment from "moment";

const BacklogTableRow = ({ data }) => {
  const tagMap = {
    Bug: "danger",
    "Technical Debt": "warning"
  };

  const { gid, name, dueOn, storyPoints, projects, tags } = data;
  const sortedTags = collect(tags)
    .pluck("name")
    .sort()
    .all();
  const [project] = projects;

  let variant = "";
  if (dueOn) {
    const now = moment();
    if (dueOn.isBefore(now.add(7, "days"))) {
      variant = "danger";
    } else if (dueOn.isBefore(now.add(14, "days"))) {
      variant = "warning";
    }
  }

  return (
    <>
      <td className="align-middle">
        <a
          href={`https://app.asana.com/0/${project.gid}/${gid}/f`}
          rel="noopener noreferrer"
          target="_blank"
          className="btn btn-link text-left d-block"
        >
          <span>{name} </span>
        </a>
        {tags.length > 0 && (
          <span className="ml-3">
            {sortedTags.map((name, index) => (
              <Badge
                key={index}
                variant={tagMap[name] || "secondary"}
                className="mr-1"
              >
                {name}
              </Badge>
            ))}
          </span>
        )}
      </td>
      <td className={`align-middle text-${variant} text-nowrap`}>
        {dueOn && dueOn.fromNow()}
      </td>
      <td className="align-middle text-right">
        {storyPoints ? (
          storyPoints
        ) : (
          <FontAwesomeIcon
            className={`text-${variant || "warning"}`}
            icon={faQuestion}
          />
        )}
      </td>
    </>
  );
};

export default BacklogTableRow;
