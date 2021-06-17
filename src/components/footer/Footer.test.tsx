import React from "react";
import { render, screen } from "@testing-library/react";

import Footer from "./Footer";

test("Renders Footer correctly", () => {
  const { container } = render(<Footer />);
  expect(container).toBeInTheDocument();
});

test("Displays the correct footer link", () => {
  render(<Footer />);
  const footerLink = screen.getByText("Osaukhu Iyamuosa");
  expect(footerLink).toBeInTheDocument();
});
