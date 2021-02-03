import React from "react";
import { Image, OverlayTrigger, Tooltip } from "react-bootstrap";
import Logo from "../../../logo.png";

export default ({ user, hideName, ...props }) => {
  const { name, photo } = user;

  const UsernameTooltipWrapper = ({ children }) => {
    if (name && hideName) {
      const UsernameTooltip = props => <Tooltip {...props}>{name}</Tooltip>;

      return (
        <OverlayTrigger
          placement="bottom"
          delay={{ show: 250, hide: 400 }}
          overlay={UsernameTooltip}
        >
          <span>{children}</span>
        </OverlayTrigger>
      );
    }

    return children;
  };

  return (
    <div {...props} style={{ height: "30px" }}>
      <UsernameTooltipWrapper>
        <Image
          src={(photo && photo.image_128x128) || Logo}
          className="h-100"
          fluid
          roundedCircle={!!photo}
        />
        {name && !hideName && <span className="pl-2">{name}</span>}
      </UsernameTooltipWrapper>
    </div>
  );
};
