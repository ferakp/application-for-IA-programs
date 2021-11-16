import 'cypress-file-upload';

describe('E2E tests for application functionalities', () => {

  // Creates a file representation for cypres-file-upload library
  const createFileReps = (fileContent, fileName) => {
    return {
      fileContent: fileContent.toString(),
      fileName: fileName,
      encoding: 'utf8',
      mimeType: 'text/plain',
      lastModified: new Date().getTime()
    };
  }

  beforeEach(() => {
    cy.visit('https://simple-ia-app.ferakp.ovh/dashboard');
  });

  it('creates reflex agent', () => {
    let fileReps = createFileReps("ID 001 TARGET TEMPERATURE RULE <22 ACTION GO_UP", "sample.txt");
    cy.get("agent-box").should('not.exist');
    cy.get('input[type="file"]').attachFile(fileReps);
    cy.get(".files-view__file-name").contains("sample.txt");
    cy.get(".dashboard__console-container .text-field__input-element").type("create agent -file 0 -class reflex");
    cy.get(".dashboard__console-container .text-field__input-element").type("{enter}");
    cy.wait(3000);
    cy.get("agent-box").should('exist');
    cy.get("agent-box .text-field__input-element").should("have.value", "initialized");
  });

  it('creates model-based reflex agent', () => {
    let fileReps = createFileReps("ID 001 TARGET TEMPERATURE RULE <22:1000 ACTION GO_UP", "sample.txt");
    cy.get("agent-box").should('not.exist');
    cy.get('input[type="file"]').attachFile(fileReps);
    cy.get(".files-view__file-name").contains("sample.txt");
    cy.get(".dashboard__console-container .text-field__input-element").type("create agent -file 0 -class model-reflex");
    cy.get(".dashboard__console-container .text-field__input-element").type("{enter}");
    cy.wait(3000);
    cy.get("agent-box").should('exist');
    cy.get("agent-box .text-field__input-element").should("have.value", "initialized");
  });

  it('creates goal-based agent', () => {
    let fileReps = createFileReps("ID 001 TARGET TEMPERATURE RULE 22 ACTION GO_UP:GO_DOWN", "sample.txt");
    cy.get("agent-box").should('not.exist');
    cy.get('input[type="file"]').attachFile(fileReps);
    cy.get(".files-view__file-name").contains("sample.txt");
    cy.get(".dashboard__console-container .text-field__input-element").type("create agent -file 0 -class goal");
    cy.get(".dashboard__console-container .text-field__input-element").type("{enter}");
    cy.wait(3000);
    cy.get("agent-box").should('exist');
    cy.get("agent-box .text-field__input-element").should("have.value", "initialized");
  });

  it('creates utility-based agent', () => {
    let fileReps = createFileReps("ID 001 TARGET TEMPERATURE RULE 22 ACTION GO_UP:GO_DOWN", "sample.txt");
    cy.get("agent-box").should('not.exist');
    cy.get('input[type="file"]').attachFile(fileReps);
    cy.get(".files-view__file-name").contains("sample.txt");
    cy.get(".dashboard__console-container .text-field__input-element").type("create agent -file 0 -class goal");
    cy.get(".dashboard__console-container .text-field__input-element").type("{enter}");
    cy.wait(3000);
    cy.get("agent-box").should('exist');
    cy.get("agent-box .text-field__input-element").should("have.value", "initialized");
  });
});
