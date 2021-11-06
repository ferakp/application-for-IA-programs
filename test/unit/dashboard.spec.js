import { update, createFile, executeTest, expectElement, expectElementAttribute, expectElementNumber, expectViewModelProperty } from '../test-utils';
import { Interpreter } from '../../src/interpreter/interpreter';
import { AppVM } from '../../src/view-models/app-vm';

describe('Test dashboard component ', () => {
  const resources = ['../../src/components/dashboard', '../../src/components/dashboard-nav', '../../src/components/console', '../../src/components/dashboard-menu',
    '../../src/components/agents-view', '../../src/components/files-view', '../../src/components/logs-view', '../../src/components/file-upload', '../../src/components/terminal-line'];

  const html = `<dashboard></dashboard>`;
  const runTest = (viewModel, done, test) => executeTest(resources, html, viewModel, done, test);

  let interpreter;
  let appVM;

  beforeEach(() => {
    interpreter = new Interpreter();
    appVM = new AppVM();
  })

  afterEach(() => {
    appVM.destroy();
  })

  it('renders component', done => {
    runTest({}, done, (component) => {
      expectElement('.dashboard__container').not.toEqual(null);
      expectElement('.dashboard__left-window ').not.toEqual(null);
      expectElement('dashboard-nav').not.toEqual(null);
      expectElement('console').not.toEqual(null);
      expectElement('dashboard-menu').not.toEqual(null);
      expectElement('agents-view ').not.toEqual(null);
      expectElement('logs-view').not.toEqual(null);
      expectElement('files-view').not.toEqual(null);
      component.viewModel.destroy();
    });
  });

  /**
   * ATTRIBUTES
   */

  it('sends commands to interpreter correctly (runInterpreter function)', done => {
    runTest({}, done, async (component) => {
      component.interpreter = interpreter;
      component.viewModel.appVM = appVM;
      component.viewModel.appVM.terminalLines = [{ text: "generate perception id 1 target tmp value 2", id: 222 }];
      await update(2000);
      expectElementNumber("terminal-line").toBe(1);
      component.viewModel.destroy();
    });
  });


});
