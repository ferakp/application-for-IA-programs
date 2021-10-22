import { bindable } from 'aurelia-framework'

export class Combobox {
  @bindable
  label

  @bindable
  controller

  @bindable
  required

  @bindable
  value

  @bindable
  language

  @bindable
  errorMessage

  @bindable
  placeholder

  @bindable
  minimalMode

  @bindable
  for

  @bindable
  items

  @bindable
  showClearButton

  @bindable
  firstLetterUpperCase

  @bindable
  allowOnlyNumbers

  /**
   * Function with following parameters
   * @param {string} value filter
   * @returns {array} response
   */
  @bindable
  dataProvider

  @bindable
  disable

  /**
   * Function with following parameters
   * @param {string} filter filter
   * @param {Array} items items to be filtered
   */
  @bindable
  customFilter

  @bindable
  hideSuffixContainer

  @bindable
  dropDownListOpened = false

  isAttached = false

  _comboboxItems = []

  _focusedIndex = -1

  // Prevents valueChange() reopening the drop down list
  _itemSelectedFlag = false

  @bindable
  inputElement

  @bindable
  heavyMode = false

  dropDownListDirectionTop = false

  attached() {
    this.isAttached = true
  }

  /**
   * LISTENERS (CLICKED/SELECTED) FUNCTIONS
   */

  _inputElementEnterPressed = async () => {
    if (this._focusedIndex >= 0 && this._focusedIndex < this._comboboxItems.length) {
      this.value = this._comboboxItems[this._focusedIndex]
      this._focusedIndex = -1
      this.dropDownListOpened = false
    }
  }

  dropDownListIconClicked() {
    this.dropDownListOpened = !this.dropDownListOpened
  }

  itemSelected(newValue) {
    this._itemSelectedFlag = true
    this.value = newValue
    this._focusedIndex = -1
    this.dropDownListOpened = false
  }

  _inputElementClicked = async () => {
    if (!this.heavyMode) {
      this.applyFiltering()
      this.dropDownListOpened = true
    }
  }

  _outsideDropDownClicked = (event) => {
    const container = this.comboboxUpperContainer.parentElement
    if (container !== event.target && !container.contains(event.target)) {
      this.dropDownListOpened = false
    }
  }

  /**
   * CHANGED FUNCTIONS
   */

  inputElementChanged(newValue) {
    if (newValue) {
      this.inputElement.addEventListener('keydown', async (e) => {
        if (
          (e.keyCode === 40 || e.keyCode === 38) &&
          this._comboboxItems.length > 0 &&
          this._focusedIndex < this._comboboxItems.length &&
          this.dropDownListOpened
        ) {
          if (e.keyCode === 40 && this._focusedIndex < this._comboboxItems.length - 1) {
            e.preventDefault()
            this._focusedIndex += 1
          } else if (e.keyCode === 38) {
            e.preventDefault()
            if (this._focusedIndex > 0) this._focusedIndex -= 1
          }
        }
        this.dropDownList.scrollTop = 40 * this._focusedIndex
      })
    }
  }

  async valueChanged(newValue) {
    if (this._itemSelectedFlag) {
      this._itemSelectedFlag = false
      return
    }
    let isDataProviderCalled = false
    // Open drop down list when value is not empty
    if (!this.dropDownListOpened && newValue && newValue.length === 1) {
      this.dropDownListOpened = true
      isDataProviderCalled = true
    }
    if (!this.dataProvider) {
      // Routing filtering
      await this.applyFiltering()
    } else if (!isDataProviderCalled) {
      const tempItems = await this.dataProvider(this.value)
      this._comboboxItems = tempItems
    }
  }

  async dropDownListOpenedChanged(newValue) {
    if (newValue) document.body.addEventListener('mouseup', this._outsideDropDownClicked)
    else {
      document.body.removeEventListener('mouseup', this._outsideDropDownClicked)
      this._focusedIndex = -1
    }
    if (newValue && this.dataProvider) {
      const tempItems = await this.dataProvider(this.value)
      this._comboboxItems = tempItems
    }
    const wH = window.innerHeight
    const eB = this.dropDownListContainer.getBoundingClientRect().bottom
    if (wH - eB < 280) this.dropDownListDirectionTop = true
    else this.dropDownListDirectionTop = false
  }

  async itemsChanged(newValue) {
    // Return if data provider is provided
    if (this.dataProvider) return
    this.applyFiltering()
  }

  /**
   * FILTERING FUNCTIONS
   */

  applyFiltering() {
    const currentFilter = this.customFilter ?? this._defaultFilter
    if (this.value && this.heavyMode) this.dropDownListOpened = true
    else if (!this.value && this.heavyMode) {
      this.dropDownListOpened = false
      return
    }
    this._comboboxItems = currentFilter(this.value, this.items)
    if (this._comboboxItems && this._comboboxItems.length === 0) this.dropDownListOpened = false
  }

  _defaultFilter = (value, items) => {
    if (value && items && items.length > 0) {
      const tempValidItems = items.filter((e) => e.toLowerCase().includes(value.toLowerCase()))
      // items.forEach((e) => {
      //   if (e.toLowerCase().includes(value.toLowerCase())) tempValidItems.push(e);
      // });
      return tempValidItems
    }
    return items ?? []
  }
}
