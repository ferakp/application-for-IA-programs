import { bindable } from "aurelia-framework";

export class TextField {
  @bindable
  label;

  @bindable
  controller;

  @bindable
  required;

  @bindable
  value;

  @bindable
  errorMessage;

  @bindable
  inputEnterCallback;

  @bindable
  placeholder;

  @bindable
  for;

  @bindable
  inputClickCallback;

  @bindable
  firstLetterUpperCase;

  @bindable
  allowOnlyNumbers;

  @bindable
  showClearButton;

  @bindable
  disable;

  @bindable
  hideSuffixContainer = false;

  @bindable
  minimalMode = false;

  hasBeenEdited = false;

  activateClearButton = false;

  tempValueChangedBlock = false;

  attached() {
    this.textFieldInputElement.addEventListener("keyup", (e) => {
      if (e.keyCode === 13) {
        this.inputEnterPressed();
      }
    });
  }

  /**
   * Changes the hasBeenEdited property to true when user writes something into the input element
   * @param {string} newValue the new value of value attribute
   */
  valueChanged(newValue, previousValue) {
    if (newValue && this.showClearButton) this.activateClearButton = true;
    else this.activateClearButton = false;
    if (!this.hasBeenEdited && newValue) this.hasBeenEdited = true;
    this.upperCaseCheck();
  }

  upperCaseCheck = () => {
    if (
      this.firstLetterUpperCase &&
      this.value &&
      this.value[0] !== this.value[0].toUpperCase()
    ) {
      setTimeout(
        () =>
          (this.value =
            this.value.charAt(0).toUpperCase() + this.value.slice(1)),
        200
      );
    }
  };

  // This function is called by icon container when ?-icon is clicked
  tooltipClicked() {}

  inputEnterPressed() {
    if (this.inputEnterCallback) this.inputEnterCallback();
  }

  inputElementClicked() {
    if (this.inputClickCallback) this.inputClickCallback();
  }

  clearButtonClicked() {
    this.value = "";
  }
}
