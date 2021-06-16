import React from "react";
import "./Footer.css";

function Footer(): JSX.Element {
  return (
    <footer className="footer">
      <p>
        Copyright &#169; 2020{" "}
        <a
          href="https://twitter.com/intent/user?screen_name=ukhu_"
          className="footer__twitter-link"
        >
          Osaukhu Iyamuosa
        </a>
      </p>
    </footer>
  );
}

export default Footer;
