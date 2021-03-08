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
import {
  loadOrganisations,
  loadRepositories
} from "../../scripts/redux/actions/githubActions";

const GithubSettings = ({ configured }) => {
  const dispatch = useDispatch();

  const settings = useSelector(state => state.settings);
  const { data: githubOrganisations } = useSelector(
    state => state.githubOrganisations
  );
  const { data: githubRepositories } = useSelector(
    state => state.githubRepositories
  );

  const { loading } = settings;

  const [github, setGithub] = useReducer(
    (accumulator, currentValue) => ({ ...accumulator, ...currentValue }),
    { ...settings.github }
  );

  useEffect(() => {
    if (!settings.github || !githubOrganisations.length) {
      return;
    }

    const { pat, defaultOrganisation } = github;

    if (githubOrganisations.length !== 1 || !!defaultOrganisation || !pat) {
      return;
    }

    const [organisation] = githubOrganisations;
    setGithub({ defaultOrganisation: organisation.login });
    dispatch(
      updateSettings({
        settings: {
          ...settings,
          github: { ...github, defaultOrganisation: organisation.login }
        }
      })
    );
  }, [settings, dispatch, github, githubOrganisations]);

  useEffect(() => {
    const { pat } = settings.github || {};

    if (!!pat && !githubOrganisations.length) {
      dispatch(loadOrganisations());
    }
  }, [dispatch, settings.github, githubOrganisations]);

  useEffect(() => {
    if (!settings.github || !githubRepositories.length) {
      return;
    }

    const { pat, defaultRepository } = github;

    if (githubRepositories.length !== 1 || !!defaultRepository || !pat) {
      return;
    }

    const [repository] = githubRepositories;
    setGithub({ defaultRepository: repository.name });
    dispatch(
      updateSettings({
        settings: {
          ...settings,
          github: { ...github, defaultRepository: repository.name }
        }
      })
    );
  }, [settings, dispatch, github, githubRepositories]);

  useEffect(() => {
    const { pat } = settings.github || {};

    if (!!pat && !githubRepositories.length) {
      dispatch(loadRepositories());
    }
  }, [dispatch, settings.github, githubRepositories]);

  const handleSubmit = event => {
    event.preventDefault();
    event.stopPropagation();

    dispatch(updateSettings({ settings: { ...settings, github } }));
  };

  if (!configured.asana) {
    return <div />;
  }

  const { defaultOrganisation, defaultRepository } = github;

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
          {githubOrganisations.length > 0 && (
            <Form.Group as={Col} xs="12" controlId="formGithubOrganisations">
              <Form.Label>Github Organisation</Form.Label>
              {githubOrganisations.length === 1 && defaultOrganisation ? (
                <span className="d-block">{defaultOrganisation}</span>
              ) : (
                <Form.Control
                  as="select"
                  name="defaultGithubOrganisation"
                  placeholder="github organisation"
                  value={defaultOrganisation || ""}
                  onChange={({ target }) =>
                    setGithub({ defaultOrganisation: target.value })
                  }
                  required
                >
                  <option value={false}>-- please select --</option>
                  {githubOrganisations.map(({ login }, index) => (
                    <option key={index} value={login}>
                      {login}
                    </option>
                  ))}
                </Form.Control>
              )}
            </Form.Group>
          )}
          {githubRepositories.length > 0 && (
            <Form.Group as={Col} xs="12" controlId="formGithubRepositories">
              <Form.Label>Github Repository</Form.Label>
              {githubRepositories.length === 1 && defaultOrganisation ? (
                <span className="d-block">{defaultOrganisation}</span>
              ) : (
                <Form.Control
                  as="select"
                  name="defaultGithubRepository"
                  placeholder="github repository"
                  value={defaultRepository || ""}
                  onChange={({ target }) =>
                    setGithub({ defaultRepository: target.value })
                  }
                  required
                >
                  <option value={false}>-- please select --</option>
                  {collect(githubRepositories)
                    .sortBy("name")
                    .map(({ name }, index) => (
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
            <Button
              type="submit"
              variant={configured.asana ? "warning" : "primary"}
            >
              {loading ? (
                <>
                  <FontAwesomeIcon icon={faCircleNotch} spin />
                  <span className="pl-1">Updating...</span>
                </>
              ) : configured.asana ? (
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
            {configured.asana && (
              <Button
                variant="danger"
                className="float-right"
                onClick={() => {
                  dispatch(logout("github"));
                  dispatch({ type: "LOGOUT_FROM_GITHUB" });
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
