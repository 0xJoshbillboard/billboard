import '@testing-library/cypress/add-commands'
import React from 'react'

// Component-specific commands can be added here
Cypress.Commands.add('mount', (component: React.ReactNode) => {
  // Add any component mounting logic here
})

declare global {
  namespace Cypress {
    interface Chainable {
      mount(component: React.ReactNode): Chainable<void>
    }
  }
} 