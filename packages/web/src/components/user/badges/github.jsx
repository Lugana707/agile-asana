import React from "react";
import { Image } from "react-bootstrap";
import GithubLogo from "../../../images/github/GitHub-Mark-32px.png";

export default ({ user }) => {
  const { login, avatarUrl } = user;

  return (
    <div className="d-inline-block" style={{ height: "30px" }}>
      <Image
        src={avatarUrl || GithubLogo}
        className="h-100"
        fluid
        roundedCircle={!!avatarUrl}
      />
      {login && <span className="pl-2">{login}</span>}
    </div>
  );
};
