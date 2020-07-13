import React, { useReducer } from "react";
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
  faInfoCircle
} from "@fortawesome/free-solid-svg-icons";
import { useSelector, useDispatch } from "react-redux";
import moment from "moment";
import { updateSettings } from "../../scripts/redux/actions/settingsActions";

const Settings = ({ history }) => {
  const asanaDeveloperConsoleUrl = "https://app.asana.com/0/developer-console";

  const { loading, asanaApiKey, sprintStartDay = 2 } = useSelector(
    state => state.settings
  );
  const [settings, setSettings] = useReducer(
    (accumulator, currentValue) => ({ ...accumulator, ...currentValue }),
    { asanaApiKey, sprintStartDay }
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

  const SprintStartDayTooltip = props => (
    <Tooltip id="api-key-tooltip" {...props}>
      this will be used when presenting data
    </Tooltip>
  );

  return (
    <>
      <Jumbotron fluid className="bg-primary text-left">
        <Container>
          <h1>Settings</h1>
          <p>These settings be stored locally using local storage.</p>
          <Alert variant="info">No data is stored remotely!</Alert>
        </Container>
      </Jumbotron>
      <Container>
        <Form className="text-left" onSubmit={handleSubmit}>
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
                  placeholder="asana api key"
                  value={settings.asanaApiKey}
                  onChange={({ target }) =>
                    setSettings({ asanaApiKey: target.value })
                  }
                  required
                />
              </Form.Group>
            </Row>
            <Row>
              <Form.Group as={Col} xs="12" controlId="formSprintStartDay">
                <Form.Label>
                  <span className="pr-2">First Day of Sprint</span>
                  <OverlayTrigger
                    placement="right"
                    delay={{ show: 250, hide: 400 }}
                    overlay={SprintStartDayTooltip}
                  >
                    <FontAwesomeIcon icon={faInfoCircle} />
                  </OverlayTrigger>
                </Form.Label>
                <div>
                  <ButtonGroup aria-label="First Day of Sprint">
                    {moment.weekdays().map((weekday, index) => (
                      <Button
                        key={index}
                        variant={
                          index === sprintStartDay ? "primary" : "secondary"
                        }
                        onClick={() => setSettings({ sprintStartDay: index })}
                      >
                        {weekday}
                      </Button>
                    ))}
                  </ButtonGroup>
                </div>
              </Form.Group>
            </Row>
            <hr />
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

export default Settings;
