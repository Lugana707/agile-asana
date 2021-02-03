import React from "react";
import { Image, OverlayTrigger, Tooltip } from "react-bootstrap";
import GithubLogo from "../../../images/github/GitHub-Mark-32px.png";

export default ({ user, hideName, ...props }) => {
  const { login, avatarUrl } = user;

  const UsernameTooltipWrapper = ({ children }) => {
    if (login && hideName) {
      const UsernameTooltip = props => <Tooltip {...props}>{login}</Tooltip>;

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
          src={avatarUrl || GithubLogo}
          className="h-100"
          fluid
          roundedCircle={!!avatarUrl}
        />
        {login && !hideName && <span className="pl-2">{login}</span>}
      </UsernameTooltipWrapper>
    </div>
  );
};
