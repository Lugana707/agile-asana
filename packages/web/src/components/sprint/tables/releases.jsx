import React from "react";
import { Table, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import GithubUserBadge from "../../user/badges/github";

const Releases = ({ sprint }) => {
  if (!sprint) {
    return <div />;
  }

  return (
    <Table striped responsive variant="dark" borderless>
      <tbody>
        {sprint.releases.map(({ uuid, name, htmlUrl, publishedAt, author }) => (
          <tr key={uuid}>
            <td className="align-middle">
              <Button variant="link" className="pl-0">
                <a
                  href={htmlUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                  style={{ textDecoration: "none" }}
                >
                  <span>{name}</span>
                  <span className="pl-2">
                    <FontAwesomeIcon icon={faExternalLinkAlt} />
                  </span>
                </a>
              </Button>
            </td>
            <td className="align-middle">{publishedAt.format("dddd @ LT")}</td>
            <td>
              <GithubUserBadge user={author} />
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default Releases;
