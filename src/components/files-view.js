import { bindable } from 'aurelia-framework';

export class FilesView {
  @bindable
  label;

  @bindable
  files;

  supportedFileFormats;

  attached() {
    this.supportedFileFormats = ['txt'];
  }

  deleteFile = file => {
    for (let i = 0; i < this.files.length; i++) {
      if (this.files[i].name === file.name && this.files[i].size === file.size) this.files.splice(i, 1);
    }
  };
}
