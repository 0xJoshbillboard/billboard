describe("Main Application Flow", () => {
  beforeEach(() => {
    cy.visit("/");
    // Wait for header to be fully loaded and visible
    cy.get("header").should("be.visible");
  });

  it("loads the home page", () => {
    cy.get("header").should("be.visible");
    cy.get("footer").should("be.visible");
  });

  it("navigates through main sections", () => {
    cy.get("header").within(() => {
      cy.get('[data-testid="header-button-Buy Billboard"]')
        .should("be.visible")
        .click();
    });
    cy.url().should("include", "/buy");

    cy.get("header").within(() => {
      cy.get("[data-testid='header-button-Sell Space']")
        .should("be.visible")
        .click();
    });
    cy.url().should("include", "/sdk");

    cy.get("header").within(() => {
      cy.get("[data-testid='header-button-Dashboard']")
        .should("be.visible")
        .click();
    });
    cy.url().should("include", "/dashboard");

    cy.get("header").within(() => {
      cy.get("[data-testid='header-button-Governance']")
        .should("be.visible")
        .click();
    });
    cy.url().should("include", "/governance");

    cy.get("[data-testid='header-logo']").should("be.visible").click();
    cy.url().should("include", "/");
  });

  it("handles wallet connection", () => {
    // Test wallet connection
    cy.get("button").contains("Connect Wallet").should("be.visible").click();
    // Note: We can't fully test wallet connection in E2E tests
    // as it requires actual wallet interaction
  });
});
