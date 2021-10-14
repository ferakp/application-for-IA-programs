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
  terminal-lines.two-way="terminalLines"
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

  /**
   * Attributes
   */
  it("display terminal lines correctly (terminalLines attribute)", (done) => {
    runTest(
      {
        terminalLines: [
          {
            id: 1,
            text: "test",
            time: new Date(),
            color: "rgba(255, 255, 255,0.5)",
          },
        ],
      },
      done,
      () => {
        expectElement(".terminal-line__text", "innerHTML").toBe("test");
        expectElementNumber(".terminal-line__text").toBe(1);
        expectElementAttribute(".terminal-line__row-start-sign", "style").toBe(
          "background-color: rgba(255, 255, 255, 0.5);"
        );
      }
    );
  });
});
