import { bootstrap } from 'aurelia-bootstrapper';
import { StageComponent } from 'aurelia-testing';
import { PLATFORM } from 'aurelia-pal';

describe('Stage App Component', () => {
  let component;
  let parentViewModel = {};

  beforeEach(() => {
    component = StageComponent.withResources(PLATFORM.moduleName('../../src/components/combobox'))
      .inView(
        '<combobox items.to-view="items" error-message.to-view="errorMessage" placeholder.to-view="placeholder" label.to-view="label" value.two-way="value" custom-filter.to-view="customFilter" data-provider.to-view="dataProvider" required.to-view="required"></combobox>'
      )
      .boundTo(parentViewModel);
  });

  afterEach(() => component.dispose());

  it('renders component', done => {
    component
      .create(bootstrap)
      .then(() => {
        const cmb = document.querySelector('combobox');
        expect(cmb.children[0].className).toContain('combobox__container');
        expect(cmb.querySelector('text-field').querySelectorAll('.text-field__input-element').length).toBe(1);
        done();
      })
      .catch(e => {
        fail(e);
        done();
      });
  });

  /**
   * Attributes
   */

  it('displays label correctly (label attribute)', done => {
    parentViewModel.label = 'Label';
    component
      .create(bootstrap)
      .then(() => {
        const cmb = document.querySelector('combobox');
        expect(cmb.querySelector('.text-field__label-element').textContent.trim()).toBe('Label');
        done();
      })
      .catch(e => {
        fail(e);
        done();
      });
  });

  it('displays required sign correctly (required attribute)', done => {
    parentViewModel.label = 'Label';
    parentViewModel.required = true;
    component
      .create(bootstrap)
      .then(() => {
        const cmb = document.querySelector('combobox');
        expect(cmb.querySelector('.text-field__required').textContent.trim()).toBe('*');
        done();
      })
      .catch(e => {
        fail(e);
        done();
      });
  });

  it('displays value correctly (value attribute)', done => {
    parentViewModel.value = 'value-';
    component
      .create(bootstrap)
      .then(() => {
        const cmb = document.querySelector('combobox');
        expect(cmb.querySelector('.text-field__input-element').value).toBe('value-');
        done();
      })
      .catch(e => {
        fail(e);
        done();
      });
  });

  it('displays error message correctly (errorMessage attribute)', done => {
    parentViewModel.errorMessage = 'Error!';
    component
      .create(bootstrap)
      .then(async () => {
        const cmb = document.querySelector('combobox');
        cmb.querySelector('.text-field__input-element').value = 'activate hasBeenEdited controller';
        expect(cmb.querySelector('.text-field__error-message').textContent.trim()).toBe('Error!');
        done();
      })
      .catch(e => {
        fail(e);
        done();
      });
  });

  it('displays placeholder correctly (placeholder attribute)', done => {
    parentViewModel.value = '';
    parentViewModel.placeholder = 'a2m_1test_!1';
    component
      .create(bootstrap)
      .then(() => {
        const cmb = document.querySelector('combobox');
        expect(cmb.querySelector('.text-field__input-element').getAttribute('placeholder')).toBe('a2m_1test_!1');
        done();
      })
      .catch(e => {
        fail(e);
        done();
      });
  });

  it('prints items correctly in drop down list container (items attribute)', done => {
    parentViewModel.value = '';
    parentViewModel.items = ['aa', 'bb'];
    component
      .create(bootstrap)
      .then(() => {
        const cmb = document.querySelector('combobox');
        expect(cmb.querySelectorAll('.combobox__drop-down-list-item-content').length).toBe(2);
        done();
      })
      .catch(e => {
        fail(e);
        done();
      });
  });

  it('controls clear button appearance correctly (showClearButton attribute)', done => {
    parentViewModel.errorMessage = 'Error!';
    component
      .create(bootstrap)
      .then(async () => {
        const cmb = document.querySelector('combobox');
        cmb.querySelector('.text-field__input-element').value = 'activate hasBeenEdited controller';
        expect(cmb.querySelector('.text-field__error-message').textContent.trim()).toBe('Error!');
        component.viewModel.errorMessage = '';
        expect(cmb.querySelectorAll('.text-field__error-message-container-inactive').length).toBe(1);
        done();
      })
      .catch(e => {
        fail(e);
        done();
      });
  });

  it('filters drop down list items correctly with a custom data provider (dataProvider attribute)', done => {
    parentViewModel.items = null;
    parentViewModel.dataProvider = async value => {
      const items = ['abc', 'dfeg', 'jhsh'];
      if (!value) return items;
      else {
        return items.filter(e => e.includes(value));
      }
    };
    component
      .create(bootstrap)
      .then(async () => {
        component.viewModel.value = '';
        await component.viewModel._inputElementClicked();
        await 1;
        expect(component.viewModel._comboboxItems).toEqual(['abc', 'dfeg', 'jhsh']);
        component.viewModel.dropDownListIconClicked();
        component.viewModel.value = 'c';
        await component.viewModel._inputElementClicked();
        await 1;
        expect(component.viewModel._comboboxItems).toEqual(['abc']);
        component.viewModel.dropDownListIconClicked();
        component.viewModel.value = 'jh';
        await component.viewModel._inputElementClicked();
        await 1;
        expect(component.viewModel._comboboxItems).toEqual(['jhsh']);
        done();
      })
      .catch(e => {
        fail(e);
        done();
      });
  });

  /**
   * Elements
   */

  it('controls drop down list visibility (arrow down icon)', done => {
    parentViewModel.dataProvider = null;
    parentViewModel.items = ['aa', 'bb'];
    component
      .create(bootstrap)
      .then(async () => {
        const cmb = document.querySelector('combobox');
        cmb.querySelector('.combobox__suffix-container-link ').click();
        expect(component.viewModel.dropDownListOpened).toEqual(true);
        cmb.querySelector('.combobox__suffix-container-link ').click();
        expect(component.viewModel.dropDownListOpened).toEqual(false);
        done();
      })
      .catch(e => {
        fail(e);
        done();
      });
  });

  /**
   * Functions
   */

  it('controls drop down list visibility (dropDownListOpened controller)', done => {
    parentViewModel.items = ['aa', 'bb'];
    component
      .create(bootstrap)
      .then(async () => {
        component.viewModel.dropDownListIconClicked();
        expect(component.viewModel.dropDownListOpened).toEqual(true);
        component.viewModel.dropDownListIconClicked();
        expect(component.viewModel.dropDownListOpened).toEqual(false);
        done();
      })
      .catch(e => {
        fail(e);
        done();
      });
  });

  it('filters drop down list items when new value is set', done => {
    parentViewModel.items = ['aa', 'bb'];
    component
      .create(bootstrap)
      .then(async () => {
        component.viewModel.value = 'a';
        await 1;
        expect(component.viewModel._comboboxItems).toEqual(['aa']);
        component.viewModel.value = 'b';
        await 1;
        expect(component.viewModel._comboboxItems).toEqual(['bb']);
        component.viewModel.value = '';
        await 1;
        expect(component.viewModel._comboboxItems).toEqual(['aa', 'bb']);
        done();
      })
      .catch(e => {
        fail(e);
        done();
      });
  });

  it('filters drop down list items correctly when input element is clicked', done => {
    parentViewModel.items = ['aa', 'bb', 'cc'];
    component
      .create(bootstrap)
      .then(async () => {
        component.viewModel.value = '';
        component.viewModel.heavyMode = false;
        await 1;
        await component.viewModel._inputElementClicked();
        expect(component.viewModel._comboboxItems).toEqual(['aa', 'bb', 'cc']);
        component.viewModel.dropDownListIconClicked();
        component.viewModel.value = 'c';
        await 1;
        await component.viewModel._inputElementClicked();
        expect(component.viewModel._comboboxItems).toEqual(['cc']);
        done();
      })
      .catch(e => {
        fail(e);
        done();
      });
  });

  it('filters drop down list items correctly with a custom filter', done => {
    parentViewModel.items = ['aa', 'bb', 'cc'];
    parentViewModel.customFilter = (value, items) => {
      if (!Array.isArray(items)) return [];
      else if (!value) return items;
      else {
        return items.filter(e => e === value);
      }
    };
    component
      .create(bootstrap)
      .then(async () => {
        component.viewModel.value = '';
        await component.viewModel._inputElementClicked();
        expect(component.viewModel._comboboxItems).toEqual(['aa', 'bb', 'cc']);
        component.viewModel.dropDownListIconClicked();
        component.viewModel.value = 'c';
        await component.viewModel._inputElementClicked();
        expect(component.viewModel._comboboxItems).toEqual([]);
        component.viewModel.dropDownListIconClicked();
        component.viewModel.value = 'cc';
        await component.viewModel._inputElementClicked();
        expect(component.viewModel._comboboxItems).toEqual(['cc']);
        done();
      })
      .catch(e => {
        fail(e);
        done();
      });
  });
});
