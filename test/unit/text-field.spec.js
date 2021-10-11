import { update, executeTest, expectElement, expectElementAttribute, expectElementNumber, expectViewModelProperty } from "../test-utils";

describe("Test text-field component", () => {
  const resources = ["../../src/components/text-field"];

  const html = `
  
  <text-field 
  label.to-view="label"
  error-message.to-view="errorMessage"
  required.to-view="required"
  placeholder.to-view="placeholder"
  value.two-way="value"
  input-click-callback.to-view="inputClickCallback"
  first-letter-upper-case.to-view="firstLetterUpperCase"
  allow-only-numbers.to-view="allowOnlyNumbers"
  show-clear-button.to-view="showClearButton"
  disable.to-view="disable"
  >
  </text-field>

  `;

  const runTest = (viewModel, done, test) =>
    executeTest(resources, html, viewModel, done, test);

  it("renders component", (done) => {
    runTest(
      {},
      done,
      () => {
        expectElement(".text-field__container").not.toEqual(null);
        expectElementNumber(".text-field__input-element").toEqual(1);
      }
    );
  });

  /**
   * Attributes
   */

  it("displays label correctly (label attribute)", (done) => {
    runTest(
      { label: "LabelTest" },
      done,
      () => {
        expectElement(".text-field__label-element", "innerHTML").toMatch(
          "LabelTest"
        );
      }
    );
  });

  it('displays error message correctly (errorMessage attribute)', (done) => {
    runTest({ errorMessage: 'Error!' }, done, () => {
      expectElement('.text-field__error-message', 'innerHTML').toMatch('Error!');
    });
  });

  it("displays required sign correctly (required attribute)", (done) => {
    runTest({ label: "Label", required: true }, done, () => {
      expectElement(".text-field__required", "innerHTML").toMatch("*");
    });
  });

  it('displays placeholder correctly (placeholder attribute)', (done) => {
    runTest({ value: '', placeholder: 'a2_!1' }, done, () => {
      expectElementAttribute('.text-field__input-element', 'placeholder').toBe('a2_!1');
    });
  });

  it("displays value correctly (value attribute)", (done) => {
    runTest({ value: "value-" }, done, () => {
      expectElement(".text-field__input-element", "value").toBe("value-");
    });
  });

  it("calls inputClickCallback function when input is clicked (inputClickCallback attribute)", (done) => {
    let clicked = false;
    runTest({ inputClickCallback: () => {clicked = true} }, done, () => {
      document.querySelector(".text-field__input-element").click();
      expect(clicked).toBe(true);
    });
  });

  it("displays first letter in upper case (firstLetterUpperCase attribute)", (done) => {
    runTest({ value: "value-", firstLetterUpperCase: true }, done, async () => {
      await update(500);
      expectElement(".text-field__input-element", "value").toBe("Value-");
    });
  });

  it("displays only numbers (allowOnlyNumbers attribute)", (done) => {
    runTest({ value: "value-", allowOnlyNumbers: true }, done, async () => {
      await update(500);
      expectElement(".text-field__input-element", "value").toBe("");
    });
  });

  it("activates clear button (showClearButton attribute)", (done) => {
    runTest({ value: "value-", showClearButton: true }, done, async (component) => {
      await update(100);
      expectViewModelProperty(component, "activateClearButton").toBe(true);
    });
  });

  /**
   * Functions
   */
});
