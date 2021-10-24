import { inject } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';

@inject(EventAggregator)
export class FileReader {
  eventAggregator;

  constructor(eventAggregator) {
    this.eventAggregator = eventAggregator;
  }

  readFile = file => {
    if(!this.isFileTypeValid(file)) return {response: [], errorMessage: "Invalid file type"};
    
  };

  isFileTypeValid = file => {
    if (file && file.name.split('.')[file.name.split('.').length - 1] === 'txt') {
      return true;
    } else return false;
  };
}
