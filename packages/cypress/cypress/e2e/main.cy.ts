describe('Main Application Flow', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('loads the home page', () => {
    cy.get('header').should('be.visible')
    cy.get('footer').should('be.visible')
  })

  it('navigates through main sections', () => {
    // Test navigation to different sections
    cy.get('button').contains('Proposals').click()
    cy.url().should('include', '/proposals')
    
    cy.get('button').contains('Dashboard').click()
    cy.url().should('include', '/dashboard')
  })

  it('handles wallet connection', () => {
    // Test wallet connection
    cy.get('button').contains('Connect Wallet').click()
    // Note: We can't fully test wallet connection in E2E tests
    // as it requires actual wallet interaction
  })

  it('interacts with proposals', () => {
    cy.visit('/proposals')
    
    // Test proposal list
    cy.get('[data-testid="proposal-list"]').should('be.visible')
    
    // Test proposal interaction
    cy.get('[data-testid="proposal-item"]').first().click()
    cy.url().should('include', '/proposals/')
  })
}) 