import React from "react";
import { Badge, ListGroup } from "react-bootstrap";
import collect from "collect.js";

export default ({
  className,
  tag,
  children,
  defaultVariant = "secondary",
  asBadge,
  asListGroupItem
}) => {
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
        .first("value") || defaultVariant
    );
  };

  const variant = getVariantFromTag(tag);

  if (asBadge) {
    return (
      <Badge key={tag} variant={variant} className={`${className} mr-1`}>
        {children || tag}
      </Badge>
    );
  }

  if (asListGroupItem) {
    return (
      <ListGroup.Item key={tag} variant={variant} className={className}>
        {children || tag}
      </ListGroup.Item>
    );
  }

  return <div>Unsupported type!</div>;
};
