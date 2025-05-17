import React from "react";
import { mount } from "cypress/react18";
import { Ticker } from "../../../ui/src/components/Ticker";

describe("Ticker Component", () => {
  it("renders correctly", () => {
    mount(<Ticker />);
    cy.get('[data-testid="ticker"]').should("exist");
  });

  it("displays ticker items", () => {
    mount(<Ticker />);
    cy.get('[data-testid="ticker-item"]').should("have.length.at.least", 1);
  });

  it("animates ticker items", () => {
    mount(<Ticker />);
    cy.get('[data-testid="ticker-item"]').first().should("be.visible");
    // Add animation assertions here
  });
});
