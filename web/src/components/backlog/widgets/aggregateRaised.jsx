import React, { useMemo } from "react";
import { LinkContainer } from "react-router-bootstrap";
import { Card, ListGroup } from "react-bootstrap";
import moment from "moment";
import collect from "collect.js";
import pluralise from "pluralise";
import withBacklogTasks from "../withBacklogTasks";

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
          <span>{groupedByTags.sum("count")}</span>
          <span className="ml-2">Backlog Tasks Created</span>
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
        {groupedByTags &&
          groupedByTags.map(({ key, count }) => (
            <LinkContainer key={key} to="/backlog/dashboard">
              <ListGroup.Item className="bg-dark">
                <span className="text-nowrap">
                  <span>{count}</span>
                  <span className="ml-3">{pluralise(count, key)}</span>
                </span>
              </ListGroup.Item>
            </LinkContainer>
          ))}
      </ListGroup>
    </Card>
  );
};

export default withBacklogTasks(AggregateRaised);
