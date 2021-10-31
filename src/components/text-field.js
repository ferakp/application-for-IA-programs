import { bindable } from 'aurelia-framework';

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

  // Hides label container if true
  @bindable
  minimalMode = false;

  hasBeenEdited = false;

  activateClearButton = false;

  tempValueChangedBlock = false;

  attached() {
    this.textFieldInputElement.addEventListener('keyup', e => {
      if (e.keyCode === 13) {
        this.inputEnterPressed();
      }
    });

    this.disableChanged(this.disable);
  }

  /**
   * Changes the hasBeenEdited property to true when user writes something to input element
   * Checks upper case flag
   * Checks number type flag
   * @param {string} newValue the new value of value attribute
   */
  valueChanged(newValue) {
    if (newValue && this.showClearButton) this.activateClearButton = true;
    else this.activateClearButton = false;
    if (!this.hasBeenEdited && newValue) this.hasBeenEdited = true;
  }

  showClearButtonChanged(newValue) {
    if (this.value && newValue) this.activateClearButton = true;
  }

  disableChanged(newValue) {
    if (newValue && this.textFieldInputElement) this.textFieldInputElement.disabled = true;
    else if (this.textFieldInputElement) this.textFieldInputElement.disabled = false;
  }

  // This function is called by icon container when ?-icon is clicked
  tooltipClicked() {}

  inputEnterPressed() {
    if (this.inputEnterCallback) this.inputEnterCallback();
  }

  inputElementClicked() {
    if (this.inputClickCallback) this.inputClickCallback();
  }

  clearButtonClicked() {
    this.value = '';
  }
}
