import { CustomFileReader } from '../../src/custom-file-reader/custom-file-reader';

describe('Test CustomFileReader class', () => {
  let customFileReader;

  beforeEach(() => {
    customFileReader = new CustomFileReader();
  });

  afterEach(() => {
    customFileReader = null;
  });

  const createFile = (text, name, type) => {
    if (!type) type = 'txt';
    return new File([text], name + '.' + type, { type: 'text/plain' });
  };

  it('returns correct amount of rows from the file', async () => {
    let sampleText = `Row1
    Row2`;
    expect((await customFileReader.readFile(createFile([sampleText], test))).response.length).toBe(2);
  });

  it('returns correct rows from the file', async () => {
    let sampleText = `Row1
    Row2`;
    expect((await customFileReader.readFile(createFile([sampleText], test))).response.map(e => e.trim())).toEqual(expect.arrayContaining(['Row1', 'Row2']));
  });

  it('validates correct file type', () => {
    let sampleText = `Row1
    Row2`;
    expect(customFileReader.isFileTypeValid(createFile([sampleText], test, 'txt'))).toEqual(true);
    expect(customFileReader.isFileTypeValid(createFile([sampleText], test, 'txt32'))).toEqual(false);
  });
});
