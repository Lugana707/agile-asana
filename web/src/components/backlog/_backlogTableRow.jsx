import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQuestion } from "@fortawesome/free-solid-svg-icons";

const BacklogTableRow = ({ data }) => {
  const { gid, name, dueOn, storyPoints, projects } = data;
  const [project] = projects;
  return (
    <>
      <td className="align-middle">
        <a
          href={`https://app.asana.com/0/${project.gid}/${gid}/f`}
          rel="noopener noreferrer"
          target="_blank"
          className="btn btn-link text-left"
        >
          <span>{name} </span>
        </a>
      </td>
      <td className="align-middle">{dueOn && dueOn.fromNow()}</td>
      <td className="align-middle text-right">
        {storyPoints ? (
          storyPoints
        ) : (
          <FontAwesomeIcon className="text-warning" icon={faQuestion} />
        )}
      </td>
    </>
  );
};

export default BacklogTableRow;
