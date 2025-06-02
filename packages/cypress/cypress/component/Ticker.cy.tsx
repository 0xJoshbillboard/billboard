import React from "react";
import { mount } from "cypress/react18";
import { Ticker } from "../../../ui/src/components/Ticker";

describe("Ticker Component", () => {
  it("renders correctly", () => {
    mount(<Ticker />);
    cy.get('[data-cy="ticker"]').should("exist");
  });

  it("animates ticker items", () => {
    mount(<Ticker />);
    cy.get('[data-cy="ticker-item-0"]').first().should("be.visible");
  });
});
