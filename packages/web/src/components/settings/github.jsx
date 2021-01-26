import React, { useEffect, useReducer } from "react";
import { Row, Col, Form, Button } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import collect from "collect.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleNotch,
  faSave,
  faSignInAlt,
  faSignOutAlt,
  faExternalLinkAlt
} from "@fortawesome/free-solid-svg-icons";
import {
  updateSettings,
  logout
} from "../../scripts/redux/actions/settingsActions";
import withConfigured from "../withConfigured";

const GithubSettings = ({ configured }) => {
  const dispatch = useDispatch();

  const settings = useSelector(state => state.settings);

  const { loading } = settings;

  const [github, setGithub] = useReducer(
    (accumulator, currentValue) => ({ ...accumulator, ...currentValue }),
    { ...settings.github }
  );

  useEffect(() => {
    if (!settings.github || !settings.github.organisations) {
      return;
    }

    const { organisations } = settings.github;
    const { pat, defaultOrganisation } = github;

    if (organisations.length !== 1 || !!defaultOrganisation || !pat) {
      return;
    }

    const [organisation] = organisations;
    setGithub({ defaultOrganisation: organisation });
    dispatch(
      updateSettings({
        settings: {
          ...settings,
          github: { ...github, defaultOrganisation: organisation }
        }
      })
    );
  }, [settings, dispatch, github]);

  const handleSubmit = event => {
    event.preventDefault();
    event.stopPropagation();

    dispatch(updateSettings({ settings: { ...settings, github } }));
  };

  const { defaultOrganisation } = github;
  const { organisations } = settings.github || {};

  if (!configured) {
    return <div />;
  }

  return (
    <Form onSubmit={handleSubmit}>
      <fieldset disabled={loading}>
        <Row>
          <Form.Group as={Col} xs={12}>
            <Form.Label>Github Personal Access Token (optional)</Form.Label>
            <Form.Text className="pb-3" muted>
              <span className="d-block">
                <span>you can generate a PAT from </span>
                <a
                  href="https://github.com/settings/tokens"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <span>user settings in Github </span>
                  <FontAwesomeIcon icon={faExternalLinkAlt} />
                </a>
              </span>
            </Form.Text>
            <Form.Control
              type="password"
              name="pat"
              placeholder="github personal access token"
              value={
                (github.pat &&
                  new Array(github.pat.length).fill("*").join("")) ||
                ""
              }
              onChange={({ target }) => setGithub({ pat: target.value })}
            />
          </Form.Group>
          {organisations && (
            <Form.Group as={Col} xs="12" controlId="formGithubOrganisations">
              <Form.Label>Github Organisation</Form.Label>
              {organisations.length === 1 && defaultOrganisation ? (
                <span className="d-block">{defaultOrganisation.login}</span>
              ) : (
                <Form.Control
                  as="select"
                  name="asanaWorkspace"
                  placeholder="asana workspace"
                  value={(defaultOrganisation || {}).login || ""}
                  onChange={({ target }) => {
                    const { value } = target;
                    const organisation = collect(organisations)
                      .where("login", value)
                      .dump()
                      .first();
                    setGithub({ defaultOrganisation: organisation });
                  }}
                  required
                >
                  <option value={false}>-- please select --</option>
                  {organisations.map(({ login }, index) => (
                    <option key={index} value={login}>
                      {login}
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
                  dispatch(logout("github"));
                  setGithub({ pat: undefined });
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
  );
};

export default withConfigured(GithubSettings);
