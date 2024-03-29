import React from "react";
import { render, screen } from "@testing-library/react";

import Header from "./Header";
import { textMatcher } from "../../utils/testUtils";

test("Renders Header correctly", () => {
  const { container } = render(<Header />);
  expect(container).toBeInTheDocument();
});

test("Displays the correct brand name", () => {
  render(<Header />);
  const headerElement = screen.getByText(textMatcher("TUNESHIFT"));
  expect(headerElement).toBeInTheDocument();
});
