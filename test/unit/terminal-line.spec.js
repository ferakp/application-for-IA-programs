import { update, executeTest, expectElement, expectElementAttribute, expectElementNumber, expectViewModelProperty } from '../test-utils';

describe('Test terminal-line component ', () => {
  const resources = ['../../src/components/terminal-line'];

  const html = `
  <terminal-line
  terminal-line.to-view="terminalLine"
  delete-terminal-line-callback.two-way="deleteTerminalLineCallback"
  log-mode.to-view="logMode"
  ></terminal-line>`;

  const runTest = (viewModel, done, test) => executeTest(resources, html, viewModel, done, test);

  it('renders component', done => {
    runTest({}, done, () => {
      expectElement('.terminal-line__head-container').not.toEqual(null);
      expectElement('.terminal-line__content-container').not.toEqual(null);
    });
  });

  /**
   * ATTRIBUTES
   */

  it('displays text correctly (text property)', done => {
    runTest({ terminalLine: { text: 'test' } }, done, () => {
      expectElement('.terminal-line__text', 'innerHTML').toBe('test');
    });
  });

  it('displays time correctly (time property)', done => {
    const testTime = new Date();
    testTime.setHours(10);
    testTime.setMinutes(10);
    testTime.setMonth(10);
    testTime.setDate(10);
    const expectedTimeString = '10.11.2021 10:10';
    runTest({ terminalLine: { text: 'test', time: testTime } }, done, () => {
      expectElement('.terminal-line__time', 'innerHTML').toBe(expectedTimeString);
    });
  });

  it('deletes terminal line correctly (deleteTerminalLineCallback function)', done => {
    let deletedId;
    runTest(
      {
        terminalLine: {
          text: 'test',
          id: 555,
        },
        deleteTerminalLineCallback: () => {
          deletedId = 555;
        },
      },
      done,
      component => {
        component.viewModel._deleteLine();
        expect(deletedId).toBe(555);
      }
    );
  });
});
