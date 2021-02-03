import React from "react";
import { Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import ColouredBadge from "../../library/colouredBadge";
import GithubUserBadge from "../../user/badges/github";

const TableRow = ({ data: pullRequest }) => {
  const { uuid, assignees, title, htmlUrl, labels, mergedAt } = pullRequest;

  return (
    <tr key={uuid} className="d-flex pr-1">
      {false && <td className="align-middle text-center col-1"></td>}
      <td className="align-middle col">
        <a
          href={htmlUrl}
          rel="noopener noreferrer"
          target="_blank"
          as={Button}
          className="text-left d-block text-light p-0"
          style={{ textDecoration: !!mergedAt && "line-through" }}
          variant="link"
        >
          {title}
        </a>
        {labels.map(({ color, name }) => (
          <ColouredBadge key={name} colour={color}>
            {name}
          </ColouredBadge>
        ))}
      </td>
      {!mergedAt && assignees.length > 0 && (
        <td className="align-middle col-3 d-none d-md-block">
          {assignees.map(assignee => (
            <GithubUserBadge
              key={assignee.id}
              className="d-inline-block"
              user={assignee}
            />
          ))}
        </td>
      )}
      <td className="align-middle text-right text-nowrap col-2 d-none d-md-block">
        {!!mergedAt && (
          <FontAwesomeIcon
            className="text-success mr-1"
            icon={faCheck}
            size="2x"
          />
        )}
      </td>
    </tr>
  );
};

export default TableRow;
