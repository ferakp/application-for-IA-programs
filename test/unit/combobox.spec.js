import { update, executeTest, expectElement, expectElementNumber, expectElementAttribute } from '../test-utils';

const resources = ['../../src/components/combobox', '../../src/components/text-field'];

const html = `
<combobox
  items.to-view="items"
  error-message.to-view="errorMessage"
  placeholder.to-view="placeholder"
  label.to-view="label"
  value.two-way="value"
  custom-filter.to-view="customFilter"
  data-provider.to-view="dataProvider"
  required.to-view="required"
  ></combobox>
`;

const runTest = (vm, done, test) => executeTest(resources, html, vm, done, test);

describe('Test combobox component', () => {
  it('renders component', done => {
    runTest({}, done, () => {
      expectElement('.combobox__container').not.toEqual(null);
      expectElementNumber('text-field input').toEqual(1);
    });
  });

  /**
   * ATTRIBUTES
   */

  it('displays label correctly (label attribute)', done => {
    runTest({ label: 'Label' }, done, () => {
      expectElement('.text-field__label-element', 'innerHTML').toMatch('Label');
    });
  });

  it('displays required sign correctly (required attribute)', done => {
    runTest({ label: 'Label', required: true }, done, () => {
      expectElement('.text-field__required', 'innerHTML').toMatch('*');
    });
  });

  it('displays value correctly (value attribute)', done => {
    runTest({ value: 'value-' }, done, () => {
      expectElement('.text-field__input-element', 'value').toBe('value-');
    });
  });

  it('displays error message correctly (errorMessage attribute)', done => {
    runTest({ errorMessage: 'Error!' }, done, () => {
      expectElement('.text-field__error-message', 'innerHTML').toMatch('Error!');
    });
  });

  it('displays placeholder correctly (placeholder attribute)', done => {
    runTest({ value: '', placeholder: 'a2_!1' }, done, () => {
      expectElementAttribute('.text-field__input-element', 'placeholder').toBe('a2_!1');
    });
  });

  it('prints items correctly in drop down list container (items attribute)', done => {
    runTest({ value: '', items: ['aa', 'bb'] }, done, () => {
      expectElementNumber('.combobox__drop-down-list-item-content').toBe(2);
    });
  });

  it('Setting error container class inactive', done => {
    runTest({ errorMessage: 'Error!', value: 'v' }, done, async component => {
      expectElement('.text-field__error-message', 'innerHTML').toMatch('Error!');
      expectElementNumber('.text-field__error-message-container-active').toBe(1);
      component.viewModel.errorMessage = '';
      await update();
      expectElementNumber('.text-field__error-message-container-active').toBe(0);
    });
  });

  it('filters drop down list items correctly with a custom data provider (dataProvider attribute)', done => {
    function dataProvider(value) {
      const items = ['abc', 'dfeg', 'jhsh'];
      if (!value) return items;
      return items.filter(e => e.includes(value));
    }
    runTest({ dataProvider, items: null }, done, async component => {
      component.viewModel._inputElementClicked();
      await update();
      expect(component.viewModel._comboboxItems).toEqual(['abc', 'dfeg', 'jhsh']);
      component.viewModel.dropDownListIconClicked();
      component.viewModel.value = 'c';
      await update();
      expect(component.viewModel._comboboxItems).toEqual(['abc']);
    });
  });

  /**
   * ELEMENTS
   */

  it('controls drop down list visibility (arrow down icon)', done => {
    runTest({ items: ['aa', 'bb'] }, done, component => {
      document.querySelector('.combobox__suffix-container-link').click();
      expect(component.viewModel.dropDownListOpened).toEqual(true);
      document.querySelector('.combobox__suffix-container-link ').click();
      expect(component.viewModel.dropDownListOpened).toEqual(false);
    });
  });

  /**
   * FUNCTIONS
   */

  it('controls drop down list visibility (dropDownListOpened controller)', done => {
    runTest({ items: ['aa', 'bb'] }, done, async component => {
      await component.viewModel.dropDownListIconClicked();
      expect(component.viewModel.dropDownListOpened).toEqual(true);
      await component.viewModel.dropDownListIconClicked();
      expect(component.viewModel.dropDownListOpened).toEqual(false);
    });
  });

  it('filters drop down list items when new value is set', done => {
    runTest({ items: ['aa', 'bb'] }, done, async component => {
      component.viewModel.value = 'a';
      await update();
      expect(component.viewModel._comboboxItems).toEqual(['aa']);
      component.viewModel.value = 'b';
      await update();
      expect(component.viewModel._comboboxItems).toEqual(['bb']);
      component.viewModel.value = '';
      await update();
      expect(component.viewModel._comboboxItems).toEqual(['aa', 'bb']);
    });
  });

  it('filters drop down list items correctly when input element is clicked', done => {
    runTest({ items: ['aa', 'bb', 'cc'] }, done, async component => {
      component.viewModel.value = '';
      component.viewModel.heavyMode = false;
      component.viewModel._inputElementClicked();
      await update();
      expect(component.viewModel._comboboxItems).toEqual(['aa', 'bb', 'cc']);
      component.viewModel.dropDownListIconClicked();
      component.viewModel.value = 'c';
      component.viewModel._inputElementClicked();
      await update();
      expect(component.viewModel._comboboxItems).toEqual(['cc']);
    });
  });

  it('filters drop down list items correctly with a custom filter', done => {
    function customFilter(value, items) {
      if (!Array.isArray(items)) return [];
      if (!value) return items;
      return items.filter(e => e === value);
    }
    const testViewModel = { customFilter, items: ['aa', 'bb', 'cc'] };
    runTest(testViewModel, done, async component => {
      component.viewModel.value = '';
      component.viewModel._inputElementClicked();
      await update();
      expect(component.viewModel._comboboxItems).toEqual(['aa', 'bb', 'cc']);
      component.viewModel.dropDownListIconClicked();
      component.viewModel.value = 'c';
      component.viewModel._inputElementClicked();
      await update();
      expect(component.viewModel._comboboxItems).toEqual([]);
      component.viewModel.dropDownListIconClicked();
      component.viewModel.value = 'cc';
      component.viewModel._inputElementClicked();
      await update();
      expect(component.viewModel._comboboxItems).toEqual(['cc']);
    });
  });
});
