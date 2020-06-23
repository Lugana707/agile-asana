import React, { useEffect } from "react";
import { LinkContainer } from "react-router-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRedo } from "@fortawesome/free-solid-svg-icons";
import { Button, Form, FormControl } from "react-bootstrap";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Logo from "../logo.png";
import { loadProjects } from "../scripts/redux/actions/asana/projectActions";

const Header = () => {
  const { loading, asanaProjects = [] } = useSelector(
    state => state.asanaProjects
  );

  const dispatch = useDispatch();
  useEffect(() => {
    if (asanaProjects) {
      return;
    }
    dispatch(loadProjects());
  }, [asanaProjects, dispatch]);

  return (
    <header className="header">
      <Navbar collapseOnSelect expand="sm" bg="dark" variant="dark">
        <LinkContainer to="/">
          <Navbar.Brand href="#">
            <img
              src={Logo}
              height="30px"
              className="d-inline-block align-top rounded"
              alt="Sam Albon"
            />
          </Navbar.Brand>
        </LinkContainer>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="mr-auto">
            <LinkContainer to="/project">
              <Nav.Link>Sprints</Nav.Link>
            </LinkContainer>
          </Nav>
          <Form inline hidden>
            <FormControl type="text" placeholder="Search" className="mr-sm-2" />
            <Button variant="outline-info">Search</Button>
          </Form>
          <Nav className="navbar-right">
            <Nav.Link
              onClick={() => dispatch(loadProjects())}
              disabled={loading}
            >
              <FontAwesomeIcon icon={faRedo} size="1x" spin={loading} />
              <span> Reload Data</span>
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    </header>
  );
};

export default Header;
