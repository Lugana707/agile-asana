import React from "react";
import { Container } from "react-bootstrap";

const Footer = () => {
  return (
    <footer className="footer pt-2 pb-2">
      <Container className="text-muted">
        <div className="w-100">
          <div className="float-left text-left">
            <a href="mailto:hello@opencolumnist.com">Sam Albon</a>
            <span> © </span>
            <span>{new Date().getFullYear()}</span>
          </div>
          <div className="float-right text-right">
            <span>Love writing? Checkout </span>
            <a
              href="https://www.opencolumnist.com/about"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open Columnist!
            </a>
            <span className="pl-2 pr-2">|</span>
            <a href="mailto:hello@opencolumnist.com">Contact</a>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
