import React from "react";
import { Image } from "react-bootstrap";

export default ({ user }) => {
  const { name, photo } = user;

  return (
    <div className="d-inline-block" style={{ height: "30px" }}>
      {photo && (
        <Image
          src={photo.image_128x128}
          className="h-100"
          fluid
          roundedCircle
        />
      )}
      {name && <span className="pl-2">{name}</span>}
    </div>
  );
};
