import React from "react";
import { Image } from "react-bootstrap";
import Logo from "../../../logo.png";

export default ({ user }) => {
  const { login, avatar_url } = user;

  return (
    <div className="d-inline-block" style={{ height: "30px" }}>
      <Image
        src={avatar_url || Logo}
        className="h-100"
        fluid
        roundedCircle={!!avatar_url}
      />
      {login && <span className="pl-2">{login}</span>}
    </div>
  );
};
