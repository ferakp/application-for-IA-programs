describe('E2E test for upload component', () => {
  beforeEach(() => {
    cy.visit('/dashboard');
    cy.get(".dashboard-menu__files-view-element").click();
  });

  it('should activate upload component', () => {
    cy.get('input[type="file]"').attachFile("files/sample.txt");
    cy.get("#file-sumbit").click();
    cy.get(".files-view__file-name-tooltip-text").contains("sample.txt");
  });
});
