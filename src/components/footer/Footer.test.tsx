import React from "react";
import { render, screen } from "@testing-library/react";

import Footer from "./Footer";

test("Renders Footer correctly", () => {
  render(<Footer />);
  const footerLink = screen.getByText("Osaukhu Iyamuosa");
  expect(footerLink).toBeInTheDocument();
});
