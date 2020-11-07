import React, { useReducer } from "react";
import {
  Container,
  Jumbotron,
  Alert,
  Button,
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
  faInfoCircle
} from "@fortawesome/free-solid-svg-icons";
import { faRedo } from "@fortawesome/free-solid-svg-icons";
import { useSelector, useDispatch } from "react-redux";
import User from "../components/user";
import { updateSettings } from "../scripts/redux/actions/settingsActions";
import { loadAll } from "../scripts/redux/actions/asanaActions";
import withLoading from "../components/withLoading";

const Settings = ({ loading: globalLoading, history }) => {
  const asanaDeveloperConsoleUrl = "https://app.asana.com/0/developer-console";

  const { loading, asanaApiKey } = useSelector(state => state.settings);
  const [settings, setSettings] = useReducer(
    (accumulator, currentValue) => ({ ...accumulator, ...currentValue }),
    { asanaApiKey }
  );

  const dispatch = useDispatch();

  const handleSubmit = event => {
    event.preventDefault();
    event.stopPropagation();
    dispatch(updateSettings({ settings }));
    history.push("/");
  };

  const ApiKeyTooltip = props => (
    <Tooltip id="api-key-tooltip" {...props}>
      this will be used to get data from Asana
    </Tooltip>
  );

  return (
    <>
      <Jumbotron fluid className="bg-primary text-left">
        <Container>
          <h1>Settings</h1>
          <p>These settings be stored locally using local storage.</p>
          <Alert variant="info">All data is stored locally!</Alert>
          <hr className="my-4" />
          <Button
            variant="secondary"
            onClick={() => dispatch(loadAll())}
            disabled={globalLoading}
          >
            <FontAwesomeIcon icon={faRedo} size="1x" spin={!!globalLoading} />
            <span> Reload Data</span>
          </Button>
        </Container>
      </Jumbotron>
      <Container className="text-left">
        <Row>
          <Col xs={12}>
            <span className="pr-2">Currently logged in as</span>
            <User badge access />
          </Col>
        </Row>
        <hr className="my-4" />
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
                  value={settings.asanaApiKey || ""}
                  onChange={({ target }) =>
                    setSettings({ asanaApiKey: target.value })
                  }
                  required
                />
              </Form.Group>
            </Row>
            <hr className="my-4" />
            <Row>
              <Form.Group as={Col} xs="12">
                <Button type="submit" variant="warning">
                  {loading && (
                    <>
                      <FontAwesomeIcon icon={faCircleNotch} spin />
                      <span className="pl-1">Updating...</span>
                    </>
                  )}
                  {!loading && (
                    <>
                      <FontAwesomeIcon icon={faSave} />
                      <span className="pl-1">Update</span>
                    </>
                  )}
                </Button>
              </Form.Group>
            </Row>
          </fieldset>
        </Form>
      </Container>
    </>
  );
};

export default withLoading(Settings);
