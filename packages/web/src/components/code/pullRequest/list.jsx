import React, { useMemo } from "react";
import { Card, Table, Row, Col } from "react-bootstrap";
import { useSelector } from "react-redux";
import NoData from "../../library/noData";
import TableRow from "./tableRow";

const PullRequestList = ({ pullRequests, htmlUrl }) => {
  const { loading } = useSelector(state => state.githubPullRequests);

  const sortedPullRequests = useMemo(() => pullRequests, [pullRequests]);

  if (loading && pullRequests.isEmpty()) {
    return (
      <h4 className="w-100 text-center pt-4">
        <div className="loading-spinner" />
      </h4>
    );
  }

  if (pullRequests.isEmpty()) {
    return <NoData />;
  }

  return (
    <div className="rounded overflow-hidden">
      {sortedPullRequests.map(pullRequest => (
        <Card key={pullRequest.uuid} bg="dark" text="light">
          <Row>
            <Col xs={12} md={3} lg={2} className="pr-md-0">
              <Card.Body className="h-100">
                <a
                  href={pullRequest.htmlUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <Card.Title className="h-100 d-flex justify-content-center align-items-center">
                    {!!pullRequest.mergedAt ? (
                      <h4 className="position-absolute text-success">
                        {pullRequest.mergedAt.fromNow()}
                      </h4>
                    ) : (
                      <h4 className="position-absolute text-warning">
                        {pullRequest.createdAt.fromNow()}
                      </h4>
                    )}
                  </Card.Title>
                </a>
              </Card.Body>
            </Col>
            <Col className="pl-md-0">
              <Table striped variant="dark" borderless className="mb-0">
                <tbody>
                  <TableRow data={pullRequest} />
                </tbody>
              </Table>
            </Col>
          </Row>
        </Card>
      ))}
    </div>
  );
};

export default PullRequestList;
