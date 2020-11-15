import React from "react";
import { Badge } from "react-bootstrap";
import collect from "collect.js";

export default ({ tag, children, asBadge }) => {
  const getVariantFromTag = tag => {
    const map = collect([
      { key: "feature", value: "success" },
      { key: "bug", value: "danger" },
      { key: "debt", value: "warning" }
    ]);

    const tagLowerCase = tag.toLowerCase();

    return (
      map
        .filter(({ key }) => tagLowerCase.includes(key))
        .pluck("value")
        .first() || "secondary"
    );
  };

  if (asBadge) {
    return (
      <Badge key={tag} variant={getVariantFromTag(tag)} className="mr-1">
        {children || tag}
      </Badge>
    );
  }

  return <div>Unsupported type!</div>;
};
