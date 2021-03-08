import React, { useEffect } from "react";
import { withRouter } from "react-router-dom";
import { LinkContainer } from "react-router-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRedo } from "@fortawesome/free-solid-svg-icons";
import { Nav, Navbar, NavDropdown } from "react-bootstrap";
import GA4React from "ga-4-react";
import Logo from "../logo.png";
import CurrentUserBadge from "./currentUserBadge";
import withLoading from "./withLoading";
import withConfigured from "./withConfigured";

const Header = ({ loading, configured, history, location }) => {
  useEffect(() => {
    if (GA4React.isInitialized()) {
      return;
    }

    const initialiseGA4 = async () => {
      const ga4react = new GA4React("G-4VRBCKLDBX");

      const ga4 = await ga4react.initialize();
      ga4.pageview(location.pathname, location.search);

      history.listen(location =>
        ga4.pageview(location.pathname, location.search)
      );
    };

    initialiseGA4();
  }, [history, location.pathname, location.search]);

  if (!configured.asana) {
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
              <span className="pr-2" hidden={!loading}>
                <FontAwesomeIcon icon={faRedo} size="1x" spin={!!loading} />
              </span>
              <CurrentUserBadge />
            </NavLink>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    </header>
  );
};

export default withConfigured(withRouter(withLoading(Header)));
