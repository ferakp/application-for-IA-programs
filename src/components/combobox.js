import { inject, bindable } from 'aurelia-framework';

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

  _comboboxItems = [];

  attached() {
    this.isAttached = true;
    this.initialize();
  }

  initialize() {
    this.customerFilterChanged();
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
    this.applyFiltering();
    this.dropDownListOpened = true;
  };

  _outsideDropDownClicked = (event) => {
    const container = this.comboboxUpperContainer.parentElement;
    if (container !== event.target && !container.contains(event.target)) {
      this.dropDownListOpened = false;
    }
  };

  /**
   * CHANGED FUNCTIONS
   */

  async valueChanged(newValue, oldValue) {
    let isDataProviderCalled = false;
    // Open drop down list when value is not empty
    if (!this.dropDownListOpened && newValue.length === 1) {
      this.dropDownListOpened = true;
      isDataProviderCalled = true;
    }
    if (!this.dataProvider) {
      // Routing filtering
      this.applyFiltering();
    } else if (!isDataProviderCalled) {
      const tempItems = await this.dataProvider(this.value);
      this._comboboxItems = tempItems;
    }
  }

  async dropDownListOpenedChanged(newValue) {
    if (newValue) document.body.addEventListener('mouseup', this._outsideDropDownClicked);
    else {
      document.body.removeEventListener(
        'mouseup',
        this._outsideDropDownClicked,
      );
    }
    if (newValue && this.dataProvider) {
      const tempItems = await this.dataProvider(this.value);
      this._comboboxItems = tempItems;
    }
  }

  async itemsChanged(newValue) {
    // Return if data provider is provided
    if (this.dataProvider) return;
    this.applyFiltering();
  }

  customerFilterChanged() {
    if (!this.customFilter) this._currentFilter = this._defaultFilter;
    else this._currentFilter = this.customFilter;
  }

  /**
   * FILTERING FUNCTIONS
   */

  applyFiltering() {
    const currentFilter = this.customFilter ?? this._defaultFilter;
    this._comboboxItems = currentFilter(this.value, this.items);
    if (this._comboboxItems.length === 0) this.dropDownListOpened = false;
  }

  _defaultFilter = (value, items) => {
    if (value) {
      const tempValidItems = [];
      items.forEach((e) => {
        if (e.toLowerCase().includes(value.toLowerCase())) tempValidItems.push(e);
      });
      return tempValidItems;
    }
    return items;
  };
}
