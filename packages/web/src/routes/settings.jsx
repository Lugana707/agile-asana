import React, { useReducer, useEffect } from "react";
import {
  Container,
  Jumbotron,
  Alert,
  Button,
  ButtonGroup,
  Row,
  Col,
  Form,
  Tooltip,
  OverlayTrigger
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleNotch,
  faSave,
  faExternalLinkAlt,
  faInfoCircle,
  faSignInAlt,
  faSignOutAlt
} from "@fortawesome/free-solid-svg-icons";
import { useSelector, useDispatch } from "react-redux";
import collect from "collect.js";
import CurrentUserBadge from "../components/currentUserBadge";
import {
  updateSettings,
  logout
} from "../scripts/redux/actions/settingsActions";
import {
  loadAll,
  reloadRecentProjects
} from "../scripts/redux/actions/asanaActions";
import withLoading from "../components/withLoading";
import withConfigured from "../components/withConfigured";

const Settings = ({ loading: globalLoading, configured, history }) => {
  const asanaDeveloperConsoleUrl = "https://app.asana.com/0/developer-console";

  const { loading, asanaApiKey, asanaDefaultWorkspace, user } = useSelector(
    state => state.settings
  );

  const dispatch = useDispatch();

  const [settings, setSettings] = useReducer(
    (accumulator, currentValue) => ({ ...accumulator, ...currentValue }),
    { asanaApiKey, asanaDefaultWorkspace }
  );

  useEffect(() => {
    setSettings({ asanaApiKey, asanaDefaultWorkspace });
  }, [asanaApiKey, asanaDefaultWorkspace]);

  useEffect(() => {
    if (!user || !settings) {
      return;
    }

    const { workspaces } = user;
    const { asanaApiKey, asanaDefaultWorkspace } = settings;

    if (workspaces.length !== 1 || !!asanaDefaultWorkspace || !asanaApiKey) {
      return;
    }

    const [workspace] = workspaces;
    setSettings({ asanaDefaultWorkspace: workspace });
    dispatch(
      updateSettings({
        settings: { ...settings, asanaDefaultWorkspace: workspace }
      })
    );
    history.push("/");
  }, [user, settings, dispatch, history]);

  const handleSubmit = event => {
    event.preventDefault();
    event.stopPropagation();
    dispatch(updateSettings({ settings }));

    if (!settings.asanaDefaultWorkspace) {
      return false;
    }

    history.push("/");
  };

  const refreshRecent = () => {
    dispatch(reloadRecentProjects());
  };

  const ApiKeyTooltip = props => (
    <Tooltip id="api-key-tooltip" {...props}>
      this will be used to get data from Asana
    </Tooltip>
  );

  const { workspaces } = user || {};

  return (
    <>
      <Jumbotron fluid className="bg-primary text-left">
        <Container>
          <h1>Settings</h1>
          <p>These settings be stored locally using local storage.</p>
          <Alert variant="info">All data is stored locally!</Alert>
          <hr className="my-4" />
          <fieldset disabled={globalLoading}>
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
        <Form onSubmit={handleSubmit}>
          <fieldset disabled={loading}>
            <Row>
              <Form.Group as={Col} xs="12" controlId="formAsanaApiKey">
                <Form.Label>
                  <span className="pr-2">Asana API Key</span>
                  <OverlayTrigger
                    placement="right"
                    delay={{ show: 250, hide: 400 }}
                    overlay={ApiKeyTooltip}
                  >
                    <FontAwesomeIcon icon={faInfoCircle} />
                  </OverlayTrigger>
                </Form.Label>
                <Form.Text className="pb-3" muted>
                  <span className="d-block">
                    <span>you can generate an API Key from </span>
                    <a
                      href={asanaDeveloperConsoleUrl}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <span>developer console </span>
                      <FontAwesomeIcon icon={faExternalLinkAlt} />
                    </a>
                  </span>
                </Form.Text>
                <Form.Control
                  type="password"
                  name="asanaApiKey"
                  placeholder="asana api key"
                  value={
                    (settings.asanaApiKey &&
                      new Array(settings.asanaApiKey.length)
                        .fill("*")
                        .join("")) ||
                    ""
                  }
                  onChange={({ target }) =>
                    setSettings({ asanaApiKey: target.value })
                  }
                  required
                />
              </Form.Group>
              {workspaces && (
                <Form.Group as={Col} xs="12" controlId="formAsanaWorkspace">
                  <Form.Label>Asana Workspace</Form.Label>
                  {workspaces.length === 1 && asanaDefaultWorkspace ? (
                    <span className="d-block">
                      {asanaDefaultWorkspace.name}
                    </span>
                  ) : (
                    <Form.Control
                      as="select"
                      name="asanaWorkspace"
                      placeholder="asana workspace"
                      value={(settings.asanaDefaultWorkspace || {}).name || ""}
                      onChange={({ target }) => {
                        const { value } = target;
                        const workspace = collect(workspaces)
                          .where("name", value)
                          .first();
                        setSettings({ asanaDefaultWorkspace: workspace });
                      }}
                      required
                    >
                      <option value={false}>-- please select --</option>
                      {workspaces.map(({ name }, index) => (
                        <option key={index} value={name}>
                          {name}
                        </option>
                      ))}
                    </Form.Control>
                  )}
                </Form.Group>
              )}
            </Row>
            <hr className="my-4" />
            <Row>
              <Form.Group as={Col} xs="12">
                <Button
                  type="submit"
                  variant={configured ? "warning" : "primary"}
                >
                  {loading ? (
                    <>
                      <FontAwesomeIcon icon={faCircleNotch} spin />
                      <span className="pl-1">Updating...</span>
                    </>
                  ) : configured ? (
                    <>
                      <FontAwesomeIcon icon={faSave} />
                      <span className="pl-1">Update</span>
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faSignInAlt} />
                      <span className="pl-1">Sign In</span>
                    </>
                  )}
                </Button>
                {configured && (
                  <Button
                    variant="danger"
                    className="float-right"
                    onClick={() => {
                      dispatch(logout());
                      setSettings({ asanaApiKey: undefined });
                    }}
                  >
                    <FontAwesomeIcon icon={faSignOutAlt} />
                    <span className="pl-1">Logout</span>
                  </Button>
                )}
              </Form.Group>
            </Row>
          </fieldset>
        </Form>
      </Container>
    </>
  );
};

export default withConfigured(withLoading(Settings));