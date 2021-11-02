/**
 * A service for providing functions for reading rows from text file
 *
 * It accepts only .txt files and trims each row before returning it
 */
export class CustomFileReader {
  /**
   * Reads .txt file and extracts text rows from the file
   * A white space is removed around the row before returning it
   * Returns error message if .txt file is not readable
   * @param {File} file file with observations
   * @returns {Object} {response, errorMessage}
   */
  readFile = async file => {
    return await new Promise(resolve => {
      let fileReader = new FileReader();
      fileReader.onload = () => {
        if (typeof fileReader.result === 'string') resolve({ response: fileReader.result.split('\n').map(e => e.trim()), errorMessage: '' });
        else resolve({ response: '', errorMessage: 'Invalid text content' });
      };
      if (!this.isFileTypeValid(file)) resolve({ response: [], errorMessage: 'Invalid file type' });
      else fileReader.readAsText(file);
    });
  };

  /**
   * Validates file
   * Returns true if file is .txt type otherwise false
   * @param {File} file
   * @returns {boolean} response
   */
  isFileTypeValid = file => {
    if (file && file.name.split('.')[file.name.split('.').length - 1] === 'txt') {
      return true;
    } else return false;
  };
}
