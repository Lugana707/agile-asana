import React from "react";
import { Image } from "react-bootstrap";
import { useSelector } from "react-redux";

const UserBadge = () => {
  const { user } = useSelector(state => state.settings);

  if (!user) {
    return <div>Unauthenticated</div>;
  }

  const { name, photo } = user;

  return (
    <div style={{ height: "30px" }}>
      <Image src={photo.image_128x128} className="h-100" fluid roundedCircle />
      <span className="pl-2">{name}</span>
    </div>
  );
};

export default UserBadge;
