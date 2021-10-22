import { bindable } from 'aurelia-framework';

export class ComboboxTag {
  @bindable
  label;

  @bindable
  controller;

  @bindable
  required;

  @bindable
  value;

  @bindable
  selections;

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
  enableDuplicateSelections = true;

  @bindable
  enableCustomValues;

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

  dropDownListDirectionTop = false;

  _comboboxItems = [];

  _focusedIndex = -1;

  @bindable
  inputElement;

  @bindable
  minimalMode = false;

  attached() {
    this.isAttached = true;
  }

  /**
   * LISTENERS (CLICKED/SELECTED) FUNCTIONS
   */

  _inputElementEnterPressed = async () => {
    const value = this._focusedIndex >= 0 ? this._comboboxItems[this._focusedIndex] : this.value;
    if (this.enableCustomValues || this._comboboxItems.includes(value)) {
      this.itemSelected(value);
    }
  };

  dropDownListIconClicked() {
    this.dropDownListOpened = !this.dropDownListOpened;
    this.inputElement.select();
    this.inputElement.focus();
  }

  itemSelected(newValue) {
    if (!newValue) return;
    this.addSelection(newValue);
    this.value = '';
    this._focusedIndex = -1;
    this.dropDownListOpened = false;
  }

  _inputElementClicked = async () => {
    this.dropDownListOpened = true;
    this.applyFiltering();
  };

  _outsideDropDownClicked = event => {
    const container = this.comboboxTagUpperContainer.parentElement;
    if (container !== event.target && !container.contains(event.target)) {
      this.dropDownListOpened = false;
    }
  };

  _deleteTag = async index => {
    this.selections.splice(index, 1);
  };

  /**
   * CHANGED FUNCTIONS
   */

  inputElementChanged(newValue) {
    if (newValue) {
      this.inputElement.addEventListener('keydown', async e => {
        if ((e.keyCode === 40 || e.keyCode === 38) && this._comboboxItems.length > 0 && this._focusedIndex < this._comboboxItems.length && this.dropDownListOpened) {
          if (e.keyCode === 40 && this._focusedIndex < this._comboboxItems.length - 1) {
            e.preventDefault();
            this._focusedIndex += 1;
          } else if (e.keyCode === 38) {
            e.preventDefault();
            if (this._focusedIndex > 0) this._focusedIndex -= 1;
          }
        }
        this.dropDownList.scrollTop = 40 * this._focusedIndex;
      });
    }
  }

  async valueChanged(newValue) {
    if (!newValue) return;
    this._focusedIndex = -1;
    let isDataProviderCalled = false;
    // Open drop down list when value is not empty
    if (!this.dropDownListOpened && newValue.length === 1) {
      this.dropDownListOpened = true;
      isDataProviderCalled = true;
    }
    if (!this.dataProvider) {
      if (newValue.length > 0) this.dropDownListOpened = true;
      // Routing filtering
      this.applyFiltering();
    } else if (!isDataProviderCalled) {
      const tempItems = await this.dataProvider(this.value);
      this._comboboxItems = tempItems;
    }
  }

  async dropDownListOpenedChanged(newValue) {
    if (newValue) document.body.addEventListener('pointerup', this._outsideDropDownClicked);
    else {
      document.body.removeEventListener('pointerup', this._outsideDropDownClicked);
      this._focusedIndex = -1;
    }
    if (newValue && this.dataProvider) {
      const tempItems = await this.dataProvider(this.value);
      this._comboboxItems = tempItems;
    }
    this.adjustDropDownListDirection();
  }

  adjustDropDownListDirection = () => {
    const wH = window.innerHeight;
    const eB = this.dropDownListContainer.getBoundingClientRect().bottom;
    if (wH - eB < 280) this.dropDownListDirectionTop = true;
    else this.dropDownListDirectionTop = false;
  };

  async itemsChanged() {
    // Return if data provider is provided
    if (this.dataProvider) return;
    this.applyFiltering();
  }

  /**
   * FILTERING FUNCTIONS
   */

  applyFiltering() {
    const currentFilter = this.customFilter ?? this._defaultFilter;
    this._comboboxItems = currentFilter(this.value, this.items);
    if (this._comboboxItems && this._comboboxItems.length === 0) this.dropDownListOpened = false;
  }

  _defaultFilter = (value, items) => {
    if (value && items && items.length > 0) {
      const tempValidItems = [];
      items.forEach(e => {
        if (e.toLowerCase().includes(value.toLowerCase())) tempValidItems.push(e);
      });
      return tempValidItems;
    }
    return items ?? [];
  };

  /**
   * UTILITY FUNCTIONS
   */

  addSelection(item) {
    if (!Array.isArray(this.selections)) this.selections = [];
    if (!this.enableDuplicateSelections && !this.selections.includes(item)) {
      this.selections.push(item);
    } else if (this.enableDuplicateSelections) {
      this.selections.push(item);
    }
  }
}
