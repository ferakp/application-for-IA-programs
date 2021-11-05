import { update, createFile, executeTest, expectElement, expectElementAttribute, expectElementNumber, expectViewModelProperty } from '../test-utils';

describe('Test files-view component ', () => {
  const resources = ['../../src/components/files-view', '../../src/components/file-upload'];

  const html = `
  <files-view
  files.to-view="files"
  label.to-view="label"
  ></files-view>`;

  const runTest = (viewModel, done, test) => executeTest(resources, html, viewModel, done, test);

  it('renders component', done => {
    runTest({}, done, () => {
      expectElement('.files-view__container').not.toEqual(null);
      expectElement('.files-view__file-upload').not.toEqual(null);
    });
  });

  /**
   * ATTRIBUTES
   */

  it('display files correctly (files attribute)', done => {
    let file = createFile("test_content", "test", "txt");

    runTest({ label: "test", files: [file] }, done, async (component) => {
      expectElement('.files-view__file').not.toEqual(null);
      expectElement('.files-view__file-name', 'innerHTML').toBe(file.name);
      expectElementNumber('.files-view__file').toBe(1);
      component.viewModel.files.push(createFile("test content", "test1", "txt"));
      await update();
      expectElementNumber('.files-view__file').toBe(2);
    });
  });


});
