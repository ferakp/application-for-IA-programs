import { bindable, inject } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';

@inject(EventAggregator)
export class FilesView {
  @bindable
  label;

  @bindable
  files;

  supportedFileFormats;

  eventAggregator;
  activateUploadingSubscriber;

  constructor(eventAggregator) {
    this.eventAggregator = eventAggregator;
    this.activateUploadingSubscriber = this.eventAggregator.subscribe('activateUploadingComponent', agentId => {
      this.fileUpload.openFolderView();
    });
  }

  attached() {
    this.supportedFileFormats = ['txt'];
  }

  deleteFile = file => {
    for (let i = 0; i < this.files.length; i++) {
      if (this.files[i].name === file.name && this.files[i].size === file.size) this.files.splice(i, 1);
    }
  };
}
