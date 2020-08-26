import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { LinkContainer } from "react-router-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRedo } from "@fortawesome/free-solid-svg-icons";
import { Button, Form, FormControl } from "react-bootstrap";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import Logo from "../logo.png";
import { loadAll } from "../scripts/redux/actions/asanaActions";

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
          <Nav className="mr-auto">
            <LinkContainer to="/sprint">
              <Nav.Link>Sprints</Nav.Link>
            </LinkContainer>
            <NavDropdown title="Forecast" id="nav-dropdown">
              <LinkContainer to="/backlog/forecast/dashboard">
                <NavDropdown.Item>Dashboard</NavDropdown.Item>
              </LinkContainer>
              <LinkContainer to="/backlog/forecast/grid">
                <NavDropdown.Item>Grid</NavDropdown.Item>
              </LinkContainer>
            </NavDropdown>
            <LinkContainer to="/settings">
              <Nav.Link>Settings</Nav.Link>
            </LinkContainer>
          </Nav>
          <Form inline hidden>
            <FormControl type="text" placeholder="Search" className="mr-sm-2" />
            <Button variant="outline-info">Search</Button>
          </Form>
          <Nav className="navbar-right">
            <Nav.Link onClick={() => dispatch(loadAll())} disabled={loading}>
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
