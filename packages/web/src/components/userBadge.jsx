import React from "react";
import { Image } from "react-bootstrap";
import Logo from "../logo.png";

export default ({ user }) => {
  const { name, photo } = user;

  return (
    <div className="d-inline-block" style={{ height: "30px" }}>
      <Image
        src={(photo && photo.image_128x128) || Logo}
        className="h-100"
        fluid
        roundedCircle={!!photo}
      />

      {name && <span className="pl-2">{name}</span>}
    </div>
  );
};
