import React, { useReducer, useEffect } from "react";
import { withRouter } from "react-router-dom";
import {
  Row,
  Col,
  Form,
  Tooltip,
  OverlayTrigger,
  Button
} from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import collect from "collect.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSave,
  faCircleNotch,
  faSignInAlt,
  faSignOutAlt,
  faExternalLinkAlt,
  faInfoCircle
} from "@fortawesome/free-solid-svg-icons";
import {
  updateSettings,
  logout
} from "../../scripts/redux/actions/settingsActions";
import withConfigured from "../withConfigured";

const AsanaSettings = ({ configured, history }) => {
  const asanaDeveloperConsoleUrl = "https://app.asana.com/0/developer-console";

  const { loading, ...settingsFromState } = useSelector(
    state => state.settings
  );

  const { asanaApiKey, asanaDefaultWorkspace, user } = settingsFromState;

  const dispatch = useDispatch();

  const [settings, setSettings] = useReducer(
    (accumulator, currentValue) => ({ ...accumulator, ...currentValue }),
    { asanaApiKey, asanaDefaultWorkspace }
  );

  useEffect(() => {
    setSettings({
      asanaApiKey,
      asanaDefaultWorkspace
    });
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
    dispatch(updateSettings({ ...settingsFromState, settings }));

    if (!settings.asanaDefaultWorkspace) {
      return false;
    }

    history.push("/");
  };

  const { workspaces } = user || {};

  const ApiKeyTooltip = props => (
    <Tooltip id="api-key-tooltip" {...props}>
      this will be used to get data from Asana
    </Tooltip>
  );

  return (
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
                  new Array(settings.asanaApiKey.length).fill("*").join("")) ||
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
                <span className="d-block">{asanaDefaultWorkspace.name}</span>
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
        <Row>
          <Form.Group as={Col} xs="12">
            <Button type="submit" variant={configured ? "warning" : "primary"}>
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
        <hr className="my-4" />
      </fieldset>
    </Form>
  );
};

export default withRouter(withConfigured(AsanaSettings));
