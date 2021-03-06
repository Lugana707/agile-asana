import React, { useState, useMemo, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave, faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import Asana from "asana";
import collect from "collect.js";
import Table from "../../library/table";
import withConfigured from "../../withConfigured";

const BacklogModal = ({ configured, children, ...props }) => {
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

  const [backlogMatch, setBacklogMatch] = useState(
    asanaSettings.backlogMatch || ""
  );

  const valid = useMemo(() => {
    if (!backlogMatch) {
      return false;
    }

    try {
      new RegExp(backlogMatch);
    } catch {
      return false;
    }

    return true;
  }, [backlogMatch]);

  const [projects, setProjects] = useState(false);
  const filteredProjects = useMemo(
    () =>
      projects &&
      projects
        .when(valid, collection =>
          collection.filter(({ name }) =>
            new RegExp(backlogMatch, "iu").test(name)
          )
        )
        .toArray(),
    [backlogMatch, projects, valid]
  );

  const handleSave = () => {
    dispatch({
      type: "ADD_ASANASETTINGS",
      loading: false,
      value: { ...asanaSettings, backlogMatch }
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
        opt_fields: ["name", "permalink_url", "is_template"],
        archived: false
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
        {children || "Configure Backlog"}
      </Button>
      <Modal show={show} onHide={handleClose} size="lg">
        <Modal.Header
          className="bg-secondary text-dark border-bottom-0"
          closeButton
        >
          <Modal.Title>Configure Backlog</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-light overflow-auto">
          <div>
            <p>
              Everyone treats their backlog in Asana differently - some teams
              have a single project for all their backlog items, other teams
              split them up across multiple projects.
            </p>
            <p>
              In order for <span className="text-primary">agilelytics</span> to
              understand what makes up your backlog you'll need to provide a way
              to filter projects to only those that match what makes up your
              backlog.
            </p>
          </div>
          <hr className="my-4" />
          {!!projects && (
            <Form.Group>
              <Form.Control
                type="text"
                name="backlogMatch"
                placeholder="filter backlog by regex"
                value={backlogMatch}
                onChange={({ target }) => setBacklogMatch(target.value)}
                required
              />
            </Form.Group>
          )}
          <div
            className={`table-wrapper ${projects === false ? "p-3" : ""}`}
            style={{ maxHeight: "65vh" }}
          >
            <Table
              loading={projects === false}
              data={filteredProjects}
              row={TableRow}
            />
          </div>
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

export default withConfigured(BacklogModal);
