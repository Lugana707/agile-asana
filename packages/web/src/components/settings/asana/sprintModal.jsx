import React, { useState, useMemo, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave, faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import Asana from "asana";
import collect from "collect.js";
import Table from "../../library/table";
import withConfigured from "../../withConfigured";

const SprintModal = ({ configured, children, ...props }) => {
  const dispatch = useDispatch();

  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const { loading, ...settings } = useSelector(state => state.settings);
  const { ...asanaSettings } = useSelector(state => state.asanaSettings);

  const { asanaApiKey, asanaDefaultWorkspace } = settings;

  const asanaClient = useMemo(
    () => asanaApiKey && Asana.Client.create().useAccessToken(asanaApiKey),
    [asanaApiKey]
  );

  const [sprintMatch, setSprintMatch] = useState(
    asanaSettings.sprintMatch || ""
  );
  const [projects, setProjects] = useState(false);
  const filteredProjects = useMemo(
    () =>
      projects &&
      projects
        .when(!!sprintMatch, collection =>
          collection.filter(({ name }) =>
            new RegExp(sprintMatch, "iu").test(name)
          )
        )
        .toArray(),
    [sprintMatch, projects]
  );

  const valid = useMemo(() => sprintMatch, [sprintMatch]);

  const handleSave = () => {
    dispatch({
      type: "ADD_ASANASETTINGS",
      loading: false,
      value: { ...asanaSettings, sprintMatch }
    });

    handleClose();
  };

  useEffect(() => {
    if (!asanaClient || !configured.asana) {
      return;
    }

    asanaClient.projects
      .getProjectsForWorkspace(asanaDefaultWorkspace.gid, {
        // opt_expand: ".",
        opt_fields: ["name", "permalink_url", "is_template"]
      })
      .then(async collection =>
        setProjects(
          collect(await collection.fetch())
            .where("is_template", false)
            .sortBy("name")
        )
      );
  }, [asanaClient, configured.asana, asanaApiKey, asanaDefaultWorkspace]);

  if (!configured.asana) {
    return <div />;
  }

  const TableRow = ({ data }) => {
    const { gid, name, permalink_url } = data;

    return (
      <tr key={gid}>
        <td className="text-left align-middle">
          <a
            href={permalink_url}
            rel="noopener noreferrer"
            target="_blank"
            as={Button}
            className="text-left d-block text-light p-0"
            variant="link"
          >
            <span>{name}</span>
            <FontAwesomeIcon className="ml-1" icon={faExternalLinkAlt} />
          </a>
        </td>
      </tr>
    );
  };

  return (
    <>
      <Button onClick={handleShow} {...props}>
        {children || "WIP: Configure Sprints"}
      </Button>
      <Modal show={show} onHide={handleClose} size="lg" centered>
        <Modal.Header
          className="bg-secondary text-dark border-bottom-0"
          closeButton
        >
          <Modal.Title>Configure Sprints</Modal.Title>
        </Modal.Header>
        <Modal.Body
          className="bg-dark text-light overflow-auto"
          style={{ maxHeight: "50vh" }}
        >
          <div>
            <p>Everyone records their sprints in Asana differently.</p>
            <p>
              In order for <span className="text-primary">agilelytics</span> to
              understand what is a sprint you'll need to provide a way to filter
              projects to only those that match what makes up your sprints.
            </p>
          </div>
          <hr className="my-4" />
          {!!projects && (
            <Form.Group>
              <Form.Control
                type="text"
                name="sprintMatch"
                placeholder="filter sprints by regex"
                value={sprintMatch}
                onChange={({ target }) => setSprintMatch(target.value)}
                required
              />
            </Form.Group>
          )}
          <Table
            loading={projects === false}
            data={filteredProjects}
            row={TableRow}
          />
        </Modal.Body>
        <Modal.Footer className="bg-dark text-light border-top-0">
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="warning" disabled={!valid} onClick={handleSave}>
            <FontAwesomeIcon icon={faSave} />
            <span className="pl-1">Update</span>
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default withConfigured(SprintModal);
