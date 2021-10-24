import { inject } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';

@inject(EventAggregator)
export class CustomFileReader {
  eventAggregator;

  constructor(eventAggregator) {
    this.eventAggregator = eventAggregator;
  }

  /**
   * Function for parsing files and extracting observations
   * @param {File} file file with observations
   * @returns {Object} {response, errorMessage}
   */
  readFile = async file => {
    return await new Promise(resolve => {
      let fileReader = new FileReader();
      fileReader.onload = () => {
        if (typeof fileReader.result === 'string') resolve({ response: fileReader.result.split('\n'), errorMessage: '' });
        else resolve({ response: '', errorMessage: 'Invalid text content' });
      };
      if (!this.isFileTypeValid(file)) resolve({ response: [], errorMessage: 'Invalid file type' });
      else fileReader.readAsText(file);
    });
  };

  isFileTypeValid = file => {
    if (file && file.name.split('.')[file.name.split('.').length - 1] === 'txt') {
      return true;
    } else return false;
  };
}
