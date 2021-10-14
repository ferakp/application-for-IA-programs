import {
  update,
  executeTest,
  expectElement,
  expectElementAttribute,
  expectElementNumber,
  expectViewModelProperty,
} from "../test-utils";

describe("Test console component", () => {
  const resources = [
    "../../src/components/console",
    "../../src/components/terminal-line",
    "../../src/components/text-field",
  ];

  const html = `
  <console
  ></console>`;

  const runTest = (viewModel, done, test) =>
    executeTest(resources, html, viewModel, done, test);

  it("renders console component", (done) => {
    runTest({}, done, () => {
      expectElement(".console__text-field").not.toEqual(null);
      expectElement(".console__message-container").not.toEqual(null);
      expectElementNumber(".console__message-container").toBe(1);
    });
  });
});
