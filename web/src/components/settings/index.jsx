import React, { useReducer } from "react";
import {
  Container,
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
import { useSelector, useDispatch } from "react-redux";
import { updateSettings } from "../../scripts/redux/actions/settingsActions";

const Settings = ({ history }) => {
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
    <Container>
      <Form className="text-left" onSubmit={handleSubmit}>
        <fieldset disabled={loading}>
          <Row className="pb-2">
            <Form.Group as={Col} xs="12" controlId="formAsanaApiKey">
              <Form.Label>
                <span className="pr-2">Asana API Key</span>
                <OverlayTrigger
                  placement="right"
                  delay={{ show: 250, hide: 400 }}
                  overlay={ApiKeyTooltip}
                >
                  <FontAwesomeIcon icon={faInfoCircle} size="1x" />
                </OverlayTrigger>
              </Form.Label>
              <Form.Text className="text-muted pb-3">
                <span className="d-block">
                  <span>you can generate an API Key from </span>
                  <a
                    className=""
                    href={asanaDeveloperConsoleUrl}
                    rel="noopener noreferrer"
                    target="_blank"
                    aria-link={asanaDeveloperConsoleUrl}
                  >
                    <span>developer console </span>
                    <FontAwesomeIcon icon={faExternalLinkAlt} size="1x" />
                  </a>
                </span>
              </Form.Text>
              <Form.Control
                type="text"
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
            <Form.Group as={Col} xs="12">
              <Button type="submit" variant="warning">
                {loading && (
                  <>
                    <FontAwesomeIcon icon={faCircleNotch} size="1x" spin />
                    <span className="pl-1">Updating...</span>
                  </>
                )}
                {!loading && (
                  <>
                    <FontAwesomeIcon icon={faSave} size="1x" />
                    <span className="pl-1">Update</span>
                  </>
                )}
              </Button>
            </Form.Group>
          </Row>
        </fieldset>
      </Form>
    </Container>
  );
};

export default Settings;
