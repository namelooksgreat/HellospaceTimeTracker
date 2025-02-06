import { render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "../../components/theme-provider";
import { AuthProvider } from "../auth";
import React from "react";

export const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    React.createElement(
      BrowserRouter,
      null,
      React.createElement(
        AuthProvider,
        null,
        React.createElement(ThemeProvider, null, ui),
      ),
    ),
  );
};
