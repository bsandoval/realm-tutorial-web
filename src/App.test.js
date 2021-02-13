import React from "react";
import { render } from "@testing-library/react";
import App from "./App";

test("renders login screen", () => {
  const { getByText } = render(<App />);
  const toggleElement = getByText("Don't have an account?");
  expect(toggleElement).toBeInTheDocument();
});
