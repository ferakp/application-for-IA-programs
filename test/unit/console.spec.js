import {
  update,
  executeTest,
  expectElement,
  expectElementAttribute,
  expectElementNumber,
  expectViewModelProperty,
} from "../test-utils";

describe("Test checkbox component", () => {
  const resources = ["../../src/components/console", "../../src/components/terminal-line", "../../src/components/text-field"];

  const html = `
  <console
  ></console>`;

  const runTest = (viewModel, done, test) =>
    executeTest(resources, html, viewModel, done, test);

});
