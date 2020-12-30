import React, { useMemo } from "react";
import { withRouter } from "react-router-dom";
import { Button, Badge } from "react-bootstrap";
import { useSelector } from "react-redux";
import collect from "collect.js";
import Color from "color";
import randomFlatColors from "random-flat-colors";

export const ALL_TAGS_TAG = "All";

const getTagsFilterFromURL = ({ search }) =>
  collect((new URLSearchParams(search).get("tags") || "").split(",")).where(
    true
  );

const TagsFilter = ({ history }) => {
  const { asanaTags } = useSelector(state => state.asanaTags);

  const { location } = history;

  const tagsFromLocationSearch = useMemo(() => getTagsFilterFromURL(location), [
    location
  ]);

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

  const enableTag = tag => {
    const { pathname, search } = location;

    const { active } = tagsForRendering.firstWhere("name", tag);

    const tagSearch = tagsFromLocationSearch
      .when(active, collection => collection.where(true, "!==", tag))
      .when(!active, collection => collection.merge([tag]));

    const urlSearchParams = new URLSearchParams(search);

    if (tagSearch.isNotEmpty() && tag !== ALL_TAGS_TAG) {
      urlSearchParams.set("tags", tagSearch.join(","));
    } else {
      urlSearchParams.delete("tags");
    }

    history.push(`${pathname}?${urlSearchParams.toString()}`);
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

export const withTagsFilterFromURL = WrappedComponent => props => {
  const { location } = props;

  const tagsFromLocationSearch = useMemo(() => getTagsFilterFromURL(location), [
    location
  ]);

  return <WrappedComponent {...props} tagsFilter={tagsFromLocationSearch} />;
};

export default withRouter(TagsFilter);
