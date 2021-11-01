import { executeTest, expectElement, expectElementNumber} from '../test-utils';

describe('Stage App Component', () => {
  const resources = ['../../src/app'];

  const html = `<app></app>`;

  const runTest = (viewModel, done, test) => executeTest(resources, html, viewModel, done, test);

  it('renders component', done => {
    runTest({}, done, async () => {
      expectElement('.app__container').not.toEqual(null);
      expectElementNumber('.app__container').toEqual(1);
    });
  });
});
