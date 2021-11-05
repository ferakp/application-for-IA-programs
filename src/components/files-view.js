import { bindable, inject } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';
/**
 * A class (view model) for files-view component
 * 
 * The files-view component is a view for handling files, it allows upload, deletion and view of files
 */
@inject(EventAggregator)
export class FilesView {
  @bindable
  label;

  @bindable
  files;

  // Restricted file formats (Array)
  restrictedFileFormats;

  eventAggregator;
  activateUploadingSubscriber;

  constructor(eventAggregator) {
    this.eventAggregator = eventAggregator;
    this.activateUploadingSubscriber = this.eventAggregator.subscribe('activateUploadingComponent', agentId => {
      this.fileUpload.openFolderView();
    });
  }

  attached() {
    // Restricts uploaded file type to .txt type
    this.restrictedFileFormats = ['txt'];
  }

  /**
   * Deletes file by comparing the name and size of file with others
   * @param {File} file 
   */
  deleteFile = file => {
    for (let i = 0; i < this.files.length; i++) {
      if (this.files[i].name === file.name && this.files[i].size === file.size) this.files.splice(i, 1);
    }
  };
}
