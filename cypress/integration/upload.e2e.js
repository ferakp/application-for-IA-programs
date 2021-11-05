import 'cypress-file-upload';

describe('E2E test for upload component', () => {
  beforeEach(() => {
    cy.visit('https://simple-ia-app.ferakp.ovh/dashboard');
    cy.get(".dashboard-menu__files-view-element").click();
  });

  it('should activate upload component', () => {
    cy.get('input[type="file"]').attachFile("sample.txt", {allowEmpty: true});
    cy.get(".files-view__file-name-tooltip-text").contains("sample.txt");
  });
});
