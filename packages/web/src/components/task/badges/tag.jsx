import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import collect from "collect.js";
import ColouredBadge from "../../library/colouredBadge";

export default ({ className, tag, children }) => {
  const { data: tags } = useSelector(state => state.tags);

  const colour = useMemo(() => collect(tags).firstWhere("name", tag).color, [
    tags,
    tag
  ]);

  return <ColouredBadge colour={colour}>{children || tag}</ColouredBadge>;
};
