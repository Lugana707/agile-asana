import React from "react";
import {
  Container,
  Jumbotron,
  Alert,
  Button,
  ButtonGroup,
  Row,
  Col
} from "react-bootstrap";
import { useDispatch } from "react-redux";
import CurrentUserBadge from "../components/currentUserBadge";
import {
  loadAll,
  reloadRecentProjects
} from "../scripts/redux/actions/asanaActions";
import withLoading from "../components/withLoading";
import withConfigured from "../components/withConfigured";
import AsanaSettings from "../components/settings/asana";
import GithubSettings from "../components/settings/github";

const Settings = ({ loading, configured }) => {
  const dispatch = useDispatch();

  const refreshRecent = () => {
    dispatch(reloadRecentProjects());
  };

  return (
    <>
      <Jumbotron fluid className="bg-primary text-left">
        <Container>
          <h1>Settings</h1>
          <p>These settings be stored locally using local storage.</p>
          <Alert variant="info">All data is stored locally!</Alert>
          <hr className="my-4" />
          <fieldset disabled={loading}>
            <ButtonGroup>
              <Button variant="dark" onClick={() => dispatch(loadAll())}>
                Reload All
              </Button>
              <Button variant="dark" onClick={() => refreshRecent()}>
                Refresh Recent
              </Button>
            </ButtonGroup>
          </fieldset>
        </Container>
      </Jumbotron>
      <Container className="text-left">
        {configured && (
          <>
            <Row>
              <Col xs={12}>
                <span className="pr-2">Currently logged in as</span>
                <CurrentUserBadge />
                <span>.</span>
              </Col>
            </Row>
            <hr className="my-4" />
          </>
        )}
        <AsanaSettings />
        <GithubSettings />
      </Container>
    </>
  );
};

export default withConfigured(withLoading(Settings));
