import { update, createFile, executeTest, expectElement, expectElementAttribute, expectElementNumber, expectViewModelProperty } from '../test-utils';
import { Agent } from '../../src/view-models/agent-vm';
import { AppVM } from '../../src/view-models/app-vm';
import { CustomFileReader } from '../../src/custom-file-reader/custom-file-reader';

describe('Test agents-view component ', () => {
  const resources = ['../../src/components/agents-view', '../../src/components/agent-box'];

  const html = `
  <agents-view
  agents.to-view="agents"
  ></agents-view>`;

  const runTest = (viewModel, done, test) => executeTest(resources, html, viewModel, done, test);

  it('renders component', done => {
    runTest({}, done, () => {
      expectElement('.agents-view__container ').not.toEqual(null);
      expectElement('.agents-view__agent-container').not.toEqual(null);
    });
  });

  /**
   * ATTRIBUTES
   */

  it('display agents (agents attribute)', done => {
    let file = createFile("ID 1 TARGET TEMPERATURE RULE <22 ACTION WARM_UP", "test", "txt");
    let sampleAppVM = new AppVM();
    sampleAppVM.registerFileReader(new CustomFileReader());
    let sampleAgent = new Agent(sampleAppVM, 0, file, null);
    runTest({ agents: [sampleAgent] }, done, async (component) => {
      await update(500);
      expectElement('agent-box').not.toEqual(null);
      expectElement('.agent-box__name', 'innerHTML').toBe(sampleAgent.name);
      expectElement('.agent-box__id', 'innerHTML').toBe((sampleAgent.id).toString());
      expectElement('.agent-box__type', 'innerHTML').toBe("Reflex agent");
      expectElementNumber('agent-box').toBe(1);
      if (sampleAgent) { sampleAgent.appVMApi.destroy(); sampleAgent.terminate(); }
    });
  });


});
