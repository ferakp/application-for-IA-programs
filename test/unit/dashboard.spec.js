import { update, createFile, executeTest, expectElement, expectElementAttribute, expectElementNumber, expectViewModelProperty } from '../test-utils';

describe('Test files-view component ', () => {
  const resources = ['../../src/components/dashboard', '../../src/components/dashboard-nav', '../../src/components/console', '../../src/components/dashboard-menu', '../../src/components/agents-view', '../../src/components/files-view', '../../src/components/logs-view'];

  const html = `<dashboard></dashboard>`;

  const runTest = (viewModel, done, test) => executeTest(resources, html, viewModel, done, test);

  it('renders component', done => {
    runTest({}, done, () => {
      expectElement('.dashboard__container').not.toEqual(null);
      expectElement('.dashboard__left-window ').not.toEqual(null);
      expectElement('dashboard-nav').not.toEqual(null);
      expectElement('console').not.toEqual(null);
      expectElement('dashboard-menu').not.toEqual(null);
      expectElement('agents-view ').not.toEqual(null);
      expectElement('logs-view').not.toEqual(null);
      expectElement('files-view').not.toEqual(null);
    });
  });

  /**
   * ATTRIBUTES
   */




});
