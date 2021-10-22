import { executeTest, expectElement, expectElementNumber } from '../test-utils';

describe('Test checkbox component', () => {
  const resources = ['../../src/components/checkbox'];

  const html = `
  <checkbox
  name.to-view="name"
  checked.two-way="checked"
  ></checkbox>`;

  const runTest = (viewModel, done, test) => executeTest(resources, html, viewModel, done, test);

  it('renders component', (done) => {
    runTest({}, done, () => {
      expectElement('.checkbox__container').not.toEqual(null);
      expectElementNumber('.checkbox__input').toEqual(1);
    });
  });

  /**
   * Attributes
   */

  it('displays name correctly (name attribute)', (done) => {
    runTest({ name: 'LabelTest' }, done, () => {
      expectElement('.checkbox__label', 'innerHTML').toMatch('LabelTest');
    });
  });

  it('displays the value of checked attribute correctly (checked attribute)', (done) => {
    runTest({ name: 'LabelTest', checked: true }, done, () => {
      expectElement('.checkbox__input', 'checked').toBe(true);
    });
  });
});
