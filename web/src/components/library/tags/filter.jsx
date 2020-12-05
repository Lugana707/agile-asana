import React, { useEffect, useMemo } from "react";
import { withRouter } from "react-router-dom";
import { Button, Badge } from "react-bootstrap";
import { useSelector } from "react-redux";
import collect from "collect.js";
import Color from "color";
import randomFlatColors from "random-flat-colors";

const ALL_TAGS_TAG = "All";

const TagsFilter = ({ history, setTags }) => {
  const { asanaTags } = useSelector(state => state.asanaTags);

  const { location } = history;

  const tagsFromLocationSearch = useMemo(
    () =>
      collect(
        (new URLSearchParams(location.search).get("tags") || "").split(",")
      ).where(true),
    [location.search]
  );

  const tagsForRendering = useMemo(
    () =>
      collect(asanaTags)
        .sortBy(({ name }) => name.toLowerCase())
        .map(({ name, color }) => ({
          name,
          color,
          active: tagsFromLocationSearch.contains(name)
        }))
        .prepend({
          name: ALL_TAGS_TAG,
          color: randomFlatColors("blue"),
          active:
            tagsFromLocationSearch.isEmpty() ||
            tagsFromLocationSearch.contains(ALL_TAGS_TAG)
        }),
    [asanaTags, tagsFromLocationSearch]
  );

  useEffect(() => {
    setTags(tagsFromLocationSearch.toArray());
  }, [setTags, tagsFromLocationSearch]);

  const enableTag = tag => {
    const { pathname } = location;

    const { active } = tagsForRendering.firstWhere("name", tag);

    const tagSearch = tagsFromLocationSearch
      .when(active, collection => collection.where(true, "!==", tag))
      .when(!active, collection => collection.merge([tag]));
    if (tagSearch.isNotEmpty()) {
      history.push(`${pathname}?tags=${tagSearch.join(",")}`);
    } else {
      history.push(pathname);
    }
  };

  return (
    <div>
      {tagsForRendering.map(({ name, color, active }, index) => (
        <Button
          key={index}
          variant="link"
          size="sm"
          className="p-0 pl-1 pr-1"
          onClick={() => enableTag(name)}
        >
          <Badge
            className={Color(color).isLight() ? "text-dark" : "text-light"}
            style={{
              textDecoration: !active && "line-through",
              backgroundColor: color
            }}
          >
            {name}
          </Badge>
        </Button>
      ))}
    </div>
  );
};

export default withRouter(TagsFilter);
