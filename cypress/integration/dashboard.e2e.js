import 'cypress-file-upload';

describe('E2E tests for application functionalities', () => {

  // Creates a file representation for cypres-file-upload library
  const createFileAndUpload = (fileContent, fileName) => {
    cy.get('input[type="file"]').attachFile({
      fileContent: fileContent.toString(),
      fileName: fileName,
      encoding: 'utf8',
      mimeType: 'text/plain',
      lastModified: new Date().getTime()
    });
  }

  const createAgent = (type, fileIndex) => {
    writeToTerminal("create agent -file " + fileIndex + " -class " + type);
  }

  const writeToTerminal = (text) => {
    cy.get(".dashboard__console-container .text-field__input-element").type(text);
    cy.get(".dashboard__console-container .text-field__input-element").type("{enter}");
  }

  const hasPrintedLogWithText = (text) => {
    cy.get(".logs-view__console").contains(text);
  }

  const runAgent = () => {
    cy.get(".agent-box__content-row:nth-of-type(2) span:nth-of-type(2)").then(el => {
      writeToTerminal("run agent " + el.text());
    });
  }

  beforeEach(() => {
    cy.visit('https://simple-ia-app.ferakp.ovh/dashboard');
  });

  /**
   * E2E TESTS FOR TESTING FILE UPLOAD AND AGENT CREATION FEATURE
   */

  it('creates reflex agent', () => {
    createFileAndUpload("ID 001 TARGET TEMPERATURE RULE <22 ACTION GO_UP", "sample.txt");
    createAgent("reflex", 0);
    cy.get(".files-view__file-name").contains("sample.txt");
    cy.wait(3000);
    cy.get("agent-box").should('exist');
    cy.get("agent-box .text-field__input-element").should("have.value", "initialized");
  });

  it('creates model-based reflex agent', () => {
    createFileAndUpload("ID 001 TARGET TEMPERATURE RULE <22:1000 ACTION GO_UP", "sample.txt");
    createAgent("model-reflex", 0);
    cy.get(".files-view__file-name").contains("sample.txt");
    cy.wait(3000);
    cy.get("agent-box").should('exist');
    cy.get("agent-box .text-field__input-element").should("have.value", "initialized");
  });

  it('creates goal-based agent', () => {
    createFileAndUpload("ID 001 TARGET TEMPERATURE RULE 22 ACTION GO_UP:GO_DOWN", "sample.txt");
    createAgent("goal", 0);
    cy.get(".files-view__file-name").contains("sample.txt");
    cy.wait(3000);
    cy.get("agent-box").should('exist');
    cy.get("agent-box .text-field__input-element").should("have.value", "initialized");
  });

  it('creates utility-based agent', () => {
    createFileAndUpload("ID 001 TARGET TEMPERATURE RULE 22 ACTION GO_UP:GO_DOWN", "sample.txt");
    createAgent("utility", 0);
    cy.get(".files-view__file-name").contains("sample.txt");
    cy.wait(3000);
    cy.get("agent-box").should('exist');
    cy.get("agent-box .text-field__input-element").should("have.value", "initialized");
  });

  /**
   * E2E TESTS FOR RUNNING AGENTS
   */
  it('runs reflex agent', () => {
    createFileAndUpload("ID 001 TARGET TEMPERATURE RULE <22 ACTION GO_UP", "sample.txt");
    createAgent("reflex", 0);
    cy.wait(3000);
    cy.wait(1500);
    runAgent();
    cy.wait(2000);
    cy.get("agent-box .text-field__input-element").should("have.value", "running");

  });

  it('runs model-based reflex agent', () => {
    createFileAndUpload("ID 001 TARGET TEMPERATURE RULE <22:1000 ACTION GO_UP", "sample.txt");
    createAgent("model-reflex", 0);
    cy.wait(3000);
    cy.wait(1500);
    runAgent();
    cy.wait(2000);
    cy.get("agent-box .text-field__input-element").should("have.value", "running");

  });

  it('runs goal-based agent', () => {
    createFileAndUpload("ID 001 TARGET TEMPERATURE RULE 22 ACTION GO_UP:GO_DOWN", "sample.txt");
    createAgent("goal", 0);
    cy.wait(3000);
    cy.wait(1500);
    runAgent();
    cy.wait(2000);
    cy.get("agent-box .text-field__input-element").should("have.value", "running");

  });

  it('runs utility-based agent', () => {
    createFileAndUpload("ID 001 TARGET TEMPERATURE RULE 22 ACTION GO_UP:GO_DOWN", "sample.txt");
    createAgent("utility", 0);
    cy.wait(3000);
    cy.wait(1500);
    runAgent();
    cy.wait(2000);
    cy.get("agent-box .text-field__input-element").should("have.value", "running");

  });

  /**
   * E2E TESTS FOR TESTING AGENT OUTPUTS
   */

  it("chooses correct action (reflex agent)", () => {
    createFileAndUpload("ID 001 TARGET TEMPERATURE RULE <22 ACTION GO_UP", "sample.txt");
    createAgent("reflex", 0);
    cy.wait(1500);
    runAgent();
    cy.wait(2000);
    writeToTerminal("generate perception id 1 target temperature value 18");
    cy.wait(4000);
    hasPrintedLogWithText("GO_UP HAS BEEN ACTIVATED");
  });

  it("chooses correct action (model-based reflex agent)", () => {
    createFileAndUpload("ID 001 TARGET TEMPERATURE RULE <22:1000 ACTION GO_UP", "sample.txt");
    createAgent("model-reflex", 0);
    cy.wait(1500);
    runAgent();
    cy.wait(2000);
    writeToTerminal("generate perception id 1 target temperature value 18");
    cy.wait(1000);
    writeToTerminal("generate perception id 1 target temperature value 18");
    cy.wait(3000);
    hasPrintedLogWithText("GO_UP HAS BEEN ACTIVATED");
  });

  it("chooses correct action (goal-based agent)", () => {
    createFileAndUpload("ID 001 TARGET TEMPERATURE RULE 22 ACTION GO_UP:GO_DOWN", "sample.txt");
    createAgent("goal", 0);
    cy.wait(1500);
    runAgent();
    cy.wait(2000);
    writeToTerminal("generate perception id 1 target temperature value 18");
    cy.wait(3000);
    hasPrintedLogWithText("GO_UP HAS BEEN ACTIVATED");
    writeToTerminal("generate perception id 1 target temperature value 28");
    cy.wait(3000);
    hasPrintedLogWithText("GO_DOWN HAS BEEN ACTIVATED");
  });

  it("chooses correct action (utility-based agent)", () => {
    createFileAndUpload("ID 001 TARGET TEMPERATURE RULE 22 ACTION GO_UP:GO_DOWN", "sample.txt");
    createAgent("utility", 0);
    cy.wait(1500);
    runAgent();
    cy.wait(1500);
    writeToTerminal("generate perception id 1 target temperature value 18");
    writeToTerminal("generate perception id 1 target temperature value 16");
    writeToTerminal("generate perception id 1 target temperature value 17");
    cy.wait(3000);
    hasPrintedLogWithText("GO_UP HAS BEEN ACTIVATED");
    writeToTerminal("generate perception id 1 target temperature value 28");
    writeToTerminal("generate perception id 1 target temperature value 26");
    cy.wait(3000);
    hasPrintedLogWithText("GO_DOWN HAS BEEN ACTIVATED");
    writeToTerminal("generate perception id 1 target temperature value 22");
    cy.wait(3000);
    hasPrintedLogWithText("HAS REACHED ITS GOAL");
  });

});
