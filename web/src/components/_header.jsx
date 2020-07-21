import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { LinkContainer } from "react-router-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRedo } from "@fortawesome/free-solid-svg-icons";
import { Button, Form, FormControl } from "react-bootstrap";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Logo from "../logo.png";
import { loadProjects } from "../scripts/redux/actions/asana/projectActions";

const Header = () => {
  const { loading } = useSelector(state => state.globalReducer);

  const dispatch = useDispatch();

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
          <Nav>
            <LinkContainer to="/sprint">
              <Nav.Link>Sprints</Nav.Link>
            </LinkContainer>
          </Nav>
          <Nav>
            <LinkContainer to="/backlog">
              <Nav.Link>Backlog</Nav.Link>
            </LinkContainer>
          </Nav>
          <Nav className="mr-auto">
            <LinkContainer to="/settings">
              <Nav.Link>Settings</Nav.Link>
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
