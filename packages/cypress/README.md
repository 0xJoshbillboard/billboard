# Billboard UI Cypress Tests

This package contains end-to-end and component tests for the Billboard UI package using Cypress.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Start the UI development server:

```bash
cd ../ui
npm start
```

3. In a separate terminal, run the Cypress tests:

```bash
cd ../cypress
npm run cypress:open
```

## Available Scripts

- `npm run cypress:open` - Opens the Cypress Test Runner
- `npm run cypress:run` - Runs all tests in headless mode
- `npm run test` - Runs all tests
- `npm run test:component` - Runs only component tests
- `npm run test:e2e` - Runs only end-to-end tests

## Test Structure

- `cypress/component/` - Component tests
- `cypress/e2e/` - End-to-end tests
- `cypress/support/` - Support files and custom commands

## Writing Tests

### Component Tests

Component tests are located in `cypress/component/` and test individual React components in isolation.

Example:

```typescript
import { mount } from 'cypress/react18'
import { YourComponent } from '../../ui/src/components/YourComponent'

describe('YourComponent', () => {
  it('renders correctly', () => {
    mount(<YourComponent />)
    cy.get('[data-testid="your-component"]').should('exist')
  })
})
```

### E2E Tests

End-to-end tests are located in `cypress/e2e/` and test the application as a whole.

Example:

```typescript
describe("Feature", () => {
  it("should work end-to-end", () => {
    cy.visit("/");
    // Test user interactions
  });
});
```

## Best Practices

1. Use data-testid attributes for selecting elements
2. Keep tests independent and isolated
3. Use custom commands for common operations
4. Write descriptive test names
5. Follow the Arrange-Act-Assert pattern
