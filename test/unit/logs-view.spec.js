import { update, executeTest, expectElement, expectElementAttribute, expectElementNumber, expectViewModelProperty } from '../test-utils';

describe('Test logs-view component ', () => {
  const resources = ['../../src/components/logs-view', '../../src/components/console', '../../src/components/terminal-line'];

  const html = `
  <logs-view
  logs.to-view="logs"
  filters.to-view="filters"
  ></logs-view>`;

  const runTest = (viewModel, done, test) => executeTest(resources, html, viewModel, done, test);

  it('renders component', done => {
    runTest({}, done, () => {
      expectElement('.logs-view__container ').not.toEqual(null);
      expectElement('.logs-view__console').not.toEqual(null);
    });
  });

  /**
   * ATTRIBUTES
   */

  it('filters correctly (filters property)', done => {
    runTest({ logs: [{ text: "test1", id: 555, producer: { id: 111 } }, { text: "test2", id: 5551, producer: { id: 222 } }], filters: [] }, done, async (component) => {
      jest.setTimeout(10000);
      await update(1100);
      expectElementNumber('terminal-line').toBe(2);
      component.viewModel.filters.push("Agent ID: 222");
      await update(1100);
      expectElementNumber('terminal-line').toBe(1);
      component.viewModel.filters = ["Text: test1"];
      await update(1300);
      expectElementNumber('terminal-line').toBe(1);
      component.viewModel.detached();
    });
  });

});
