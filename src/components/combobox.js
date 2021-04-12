import { inject, bindable } from "aurelia-framework";
import $ from "jquery";
import { thisExpression } from "@babel/types";

export class Combobox {
  @bindable
  label;

  @bindable
  controller;

  @bindable
  required;

  @bindable
  value;

  @bindable
  language;

  @bindable
  errorMessage;

  @bindable
  placeholder;

  @bindable
  for;

  @bindable
  items;

  @bindable
  showClearButton;

  @bindable
  firstLetterUpperCase;

  @bindable
  allowOnlyNumbers;

  /**
   * Function with following parameters
   * @param {number} pageNumber page number (=index)
   * @param {number} pageSize number of items fetched at a time from the dataprovider.
   * @param {string} filter filter
   */
  @bindable
  dataProvider;

  @bindable
  disable;

  /**
   * Function with following parameters
   * @param {string} filter filter
   * @param {Array} items items to be filtered
   */
  @bindable
  customFilter;

  @bindable
  hideSuffixContainer;

  @bindable
  dropDownListOpened = false;

  isAttached = false;

  _itemsAreValid = false;

  _comboboxItems = [];

  attached() {
    this.isAttached = true;
    this.initialize();
  }

  initialize() {
    // A listener for closing the drop down list whenever anything outside of it is clicked
    document.body.addEventListener("mouseup", (e) => {
      let container = this.comboboxUpperContainer.parentElement;
      if (
        this.dropDownListOpened &&
        container !== event.target &&
        !container.contains(event.target)
      ) {
        this.dropDownListOpened = false;
      }
    });
  }

  /**
   * LISTENERS (CLICKED/SELECTED) FUNCTIONS
   */

  dropDownListIconClicked() {
    this.dropDownListOpened = !this.dropDownListOpened;
  }

  itemSelected(newValue) {
    this.value = newValue;
    this.dropDownListOpened = false;
  }

  _inputElementClicked = async () => {
    if (!this.dropDownListOpened) this.dropDownListOpened = true;
  };

  /**
   * CHANGED FUNCTIONS
   */

  async valueChanged(newValue, oldValue) {
    // Open drop down list when value is not empty
    if (newValue.length === 1) this.dropDownListOpened = true;
    if (!this.dataProvider) {
      // Routing filtering
      this.applyFiltering();
    } else {
      let tempItems = await this.dataProvider(this.value);
      if (this._isReturnedItemsValid(tempItems))
        this._comboboxItems = tempItems;
    }
  }

  async dropDownListOpenedChanged(newValue, oldValue) {
    if (!oldValue && newValue && this.dataProvider) {
      let tempItems = await this.dataProvider(this.value);
      if (this._isReturnedItemsValid(tempItems))
        this._comboboxItems = tempItems;
    }
  }

  async itemsChanged(newValue) {
    // Return if data provider is provided
    if (this.dataProvider) return;
    // If items attribute has an array of items, move them to the _comboboxItems (view)
    if (Array.isArray(newValue)) {
      this._checkItemsValidity(newValue);
      if (this._itemsAreValid) this.applyFiltering();
    }
  }

  /**
   * FILTERING FUNCTIONS
   */

  applyFiltering() {
    if (!this.customFilter) this.applyDefaultFiltering();
    else this.applyCustomFiltering();
  }

  applyDefaultFiltering() {
    if (this.value && this._itemsAreValid) {
      const tempValidItems = [];
      this.items.forEach((e) => {
        if (e.toLowerCase().includes(this.value.toLowerCase()))
          tempValidItems.push(e);
      });
      this._comboboxItems = tempValidItems;
    } else if (this._itemsAreValid) {
      this._comboboxItems = this.items;
    }
  }

  applyCustomFiltering() {
    if (this._itemsAreValid) {
      const customFilterItems = this.customFilter(this.value, this.items);
      if (
        !this._isArrayEmpty(customFilterItems) &&
        this._isReturnedItemsValid(customFilterItems)
      ) {
        this._comboboxItems = customFilterItems;
      } else {
        this._comboboxItems = [];
      }
    }
  }

  /**
   * VALIDATION AND UTILITY FUNCTIONS
   */

  _checkItemsValidity(newItems) {
    if (Array.isArray(newItems)) {
      this._itemsAreValid = !newItems.some((e) => typeof e !== "string");
    } else this._itemsAreValid = false;
  }

  _isReturnedItemsValid(customFilterItems) {
    if (Array.isArray(customFilterItems)) {
      return !customFilterItems.some((e) => typeof e !== "string");
    }
    return false;
  }

  _isArrayEmpty(array) {
    return Array.isArray(array) && array.length === 0;
  }
}
