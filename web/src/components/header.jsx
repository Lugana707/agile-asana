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

  const NavLink = ({ children, to }) => (
    <LinkContainer to={to}>
      <Nav.Link>{children}</Nav.Link>
    </LinkContainer>
  );

  const NavDropDownItem = ({ children, to }) => (
    <LinkContainer to={to}>
      <NavDropdown.Item>{children}</NavDropdown.Item>
    </LinkContainer>
  );

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
            <NavLink to="/sprint">Sprints</NavLink>
            <NavDropdown title="Forecast" id="nav-dropdown">
              <NavDropDownItem to="/backlog/forecast/dashboard">
                Dashboard
              </NavDropDownItem>
              <NavDropDownItem to="/backlog/forecast/grid">
                Grid
              </NavDropDownItem>
            </NavDropdown>
          </Nav>
          <Form inline hidden>
            <FormControl type="text" placeholder="Search" className="mr-sm-2" />
            <Button variant="outline-info">Search</Button>
          </Form>
          <Nav className="navbar-right">
            <NavLink to="/settings">Settings</NavLink>
            <Nav.Link onClick={() => dispatch(loadAll())} disabled={loading}>
              <FontAwesomeIcon icon={faRedo} size="1x" spin={loading} />
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    </header>
  );
};

export default Header;
