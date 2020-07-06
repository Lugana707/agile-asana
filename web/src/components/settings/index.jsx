import React, { useReducer } from "react";
import { Container, Button, Row, Col, Form } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNotch, faSave } from "@fortawesome/free-solid-svg-icons";
import { useSelector, useDispatch } from "react-redux";
import { updateSettings } from "../../scripts/redux/actions/settingsActions";

const Settings = event => {
  const { loading, asanaApiKey } = useSelector(state => state.settings);
  const [settings, setSettings] = useReducer(
    (accumulator, currentValue) => ({ ...accumulator, ...currentValue }),
    { asanaApiKey }
  );

  const dispatch = useDispatch();

  const handleSubmit = event => {
    event.preventDefault();
    event.stopPropagation();
    console.debug("Hello settings!", { settings });
    dispatch(updateSettings({ settings }));
  };

  return (
    <Container>
      <Form className="text-left" onSubmit={handleSubmit}>
        <fieldset disabled={loading}>
          <Row className="pb-2">
            <Form.Group as={Col} xs="12" controlId="formAsanaApiKey">
              <Form.Label>Asana API Key</Form.Label>
              <Form.Text className="text-muted pb-3">
                this will be used to get data from Asana
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
