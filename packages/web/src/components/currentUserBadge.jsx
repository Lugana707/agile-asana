import React from "react";
import { useSelector } from "react-redux";
import UserBadge from "./userBadge";

export default () => {
  const { user } = useSelector(state => state.settings);

  if (!user) {
    return <div className="d-inline-block">Unauthenticated</div>;
  }

  return <UserBadge user={user} />;
};
