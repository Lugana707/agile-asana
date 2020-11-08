import React from "react";
import { LinkContainer } from "react-router-bootstrap";
import { useSelector } from "react-redux";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import Logo from "../logo.png";
import User from "./user";

const Header = () => {
  const { asanaApiKey } = useSelector(state => state.settings);

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

  if (!asanaApiKey) {
    return <div />;
  }

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
            <NavDropdown title="Backlog" id="nav-dropdown">
              <NavDropDownItem to="/backlog/dashboard">
                Dashboard
              </NavDropDownItem>
              <NavDropDownItem to="/backlog/forecast">Forecast</NavDropDownItem>
            </NavDropdown>
          </Nav>
          <Nav className="navbar-right">
            <NavLink to="/settings">
              <User badge />
            </NavLink>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    </header>
  );
};

export default Header;
