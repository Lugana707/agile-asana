import React, { useMemo } from "react";
import { Card, ListGroup } from "react-bootstrap";
import moment from "moment";
import collect from "collect.js";
import pluralise from "pluralise";
import { getColourFromTag } from "../../../scripts/helpers/asanaColours";
import withBacklogTasks from "../withBacklogTasks";
import NoData from "../../library/noData";
import TagListGroupItem from "../../library/tags/listGroupItem";

const AggregateRaised = ({
  backlogTasks,
  dateFrom,
  dateTo,
  includeTags,
  showDateRange
}) => {
  const groupedByTags = useMemo(() => {
    const includeTagsColletion = collect(includeTags);

    return collect(
      collect(backlogTasks)
        .filter(({ createdAt }) =>
          createdAt.isBetween(dateFrom, dateTo || moment())
        )
        .pluck("tags")
        .flatten(1)
        .filter(tag => {
          if (!includeTags) {
            return true;
          }

          const tagLowerCase = tag.toLowerCase();
          return includeTagsColletion
            .map(obj => obj.toLowerCase())
            .filter(obj => tagLowerCase.includes(obj))
            .isNotEmpty();
        })
        .countBy()
        .map((count, key) => ({ key, count }))
        .toArray()
    );
  }, [backlogTasks, dateFrom, dateTo, includeTags]);

  return (
    <Card bg="dark" className="text-left text-white">
      <Card.Body>
        <Card.Title>
          <span className="ml-2">
            {pluralise.withCount(
              groupedByTags.sum("count"),
              "% Backlog Task",
              null,
              "No Backlog Tasks"
            )}
            <span> Created</span>
          </span>
        </Card.Title>
        {showDateRange && (
          <Card.Subtitle className="text-muted">
            <hr />
            <span className="d-block">
              <span className="font-weight-bold">
                {moment(dateFrom).format("MMM D")}
              </span>
              <span> to </span>
              <span className="font-weight-bold">
                {moment(dateTo).format("MMM D")}
              </span>
            </span>
          </Card.Subtitle>
        )}
      </Card.Body>
      <ListGroup variant="flush">
        {groupedByTags && groupedByTags.isNotEmpty() ? (
          groupedByTags.map(({ key, count }) => (
            <TagListGroupItem key="key" tag={key} count={count} />
          ))
        ) : (
          <ListGroup.Item className="bg-dark">
            <NoData />
          </ListGroup.Item>
        )}
      </ListGroup>
    </Card>
  );
};

export default withBacklogTasks(AggregateRaised);
