import React from "react";
import { LinkContainer } from "react-router-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRedo } from "@fortawesome/free-solid-svg-icons";
import { Nav, Navbar, NavDropdown } from "react-bootstrap";
import Logo from "../logo.png";
import CurrentUserBadge from "./currentUserBadge";
import withLoading from "./withLoading";
import withConfigured from "./withConfigured";

const Header = ({ loading: globalLoading, configured }) => {
  if (!configured) {
    return <div />;
  }

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
              alt="agilelytics"
            />
          </Navbar.Brand>
        </LinkContainer>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="mr-auto">
            <NavLink to="/sprint">Sprints</NavLink>
            <NavLink to="/task">Tasks</NavLink>
            <NavDropdown title="Backlog" id="nav-dropdown__backlog">
              <NavDropDownItem to="/backlog/dashboard">
                Dashboard
              </NavDropDownItem>
              <NavDropDownItem to="/backlog/forecast">Forecast</NavDropDownItem>
            </NavDropdown>
            <NavDropdown title="Reporting" id="nav-dropdown__reporting">
              <NavDropDownItem to="/report/sprint/effort-distribution">
                Effort Distribution
              </NavDropDownItem>
            </NavDropdown>
          </Nav>
          <Nav className="navbar-right">
            <NavLink to="/settings">
              <span className="pr-2" hidden={!globalLoading}>
                <FontAwesomeIcon
                  icon={faRedo}
                  size="1x"
                  spin={!!globalLoading}
                />
              </span>
              <CurrentUserBadge />
            </NavLink>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    </header>
  );
};

export default withConfigured(withLoading(Header));
