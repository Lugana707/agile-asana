import React from "react";
import { Image } from "react-bootstrap";
import { useSelector } from "react-redux";

const User = ({ badge, access }) => {
  const { user } = useSelector(state => state.settings);

  if (!user) {
    return <div>Unauthenticated</div>;
  }

  const { name, photo, workspaces } = user;

  return (
    <>
      {badge && (
        <div className="d-inline-block" style={{ height: "30px" }}>
          <Image
            src={photo.image_128x128}
            className="h-100"
            fluid
            roundedCircle
          />
          <span className="pl-2">{name}</span>
        </div>
      )}
      {access && (
        <div className="d-block">
          <div>With access to these workspaces:</div>
          <ul>
            {workspaces.map(({ name }) => (
              <li>{name}</li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
};

export default User;
