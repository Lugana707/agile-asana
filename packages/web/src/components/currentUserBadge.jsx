import React from "react";
import { useSelector } from "react-redux";
import AsanaUserBadge from "./user/badges/asana";

export default () => {
  const { user } = useSelector(state => state.settings);

  if (!user) {
    return <div className="d-inline-block">Unauthenticated</div>;
  }

  return <AsanaUserBadge user={user} />;
};
