import React from "react";
import { Image } from "react-bootstrap";
import { useSelector } from "react-redux";

const User = ({ badge }) => {
  const { user } = useSelector(state => state.settings);

  if (!user) {
    return <div className="d-inline-block">Unauthenticated</div>;
  }

  const { name, photo } = user;

  return (
    <>
      {badge && (
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
      )}
    </>
  );
};

export default User;
