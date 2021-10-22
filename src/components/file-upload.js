import { bindable } from 'aurelia-framework';

export class FileUpload {
  @bindable
  label;

  @bindable
  description;

  @bindable
  files;

  @bindable
  supportedFormats;

  inputContainerStyle;

  attached() {
    if (this.fileUploadInput) {
      this.fileUploadInput.onchange = () => {
        this.receiveFiles();
      };
    }

    // Prevent redirection during drag and drop mechanism
    document.querySelector('html').addEventListener('dragover', e => {
      e.preventDefault();
      e.stopPropagation();
      this.setInputLabel('Drag it here!');
      this.setInputContainerStatus('dragover');
    });

    document.querySelector('html').addEventListener('drop', e => {
      e.preventDefault();
      e.stopPropagation();
      this.setInputLabel(this.description);
      this.setInputContainerStatus('default');
    });

    // Drag enter
    this.fileUploadInputContainer.addEventListener('dragenter', e => {
      e.stopPropagation();
      e.preventDefault();
      this.setInputLabel('Drop');
      this.setInputContainerStatus('dropArea');
    });

    // Drag over
    this.fileUploadInputContainer.addEventListener('dragover', e => {
      e.stopPropagation();
      e.preventDefault();
      this.setInputLabel('Drop');
    });

    // Drop
    this.fileUploadInputContainer.addEventListener('drop', e => {
      e.stopPropagation();
      e.preventDefault();
      let file = e.dataTransfer.files[0];
      if (Array.isArray(this.files) && file) {
        if (!this.isFileUploaded(file)) {
          this.alertSuccessfulUpload();
          this.files.push(file);
        } else {
          this.alertDuplicateInsertAttempt();
        }
      }
    });
  }

  receiveFiles = () => {
    if (!this.fileUploadInput) return;
    if (!Array.isArray(this.files)) this.files = [];
    for (var i = 0; i < this.fileUploadInput.files.length; i++) {
      let file = this.fileUploadInput.files.item(i);
      if (this.isFileUploaded(file)) {
        this.alertDuplicateInsertAttempt();
        continue;
      }
      if (Array.isArray(this.supportedFormats)) {
        if (this.supportedFormats.includes(file.name.split('.')[file.name.split('.').length - 1])) this.files.push(file);
        else {
          this.alertInvalidFileType();
          continue;
        }
      } else this.files.push(this.fileUploadInput.files.item(i));
    }
    this.fileUploadInput.value = null;
  };

  openFolderView(event) {
    this.fileUploadInput.click();
  }

  /**
   * UTILITY FUNCTIONS
   */

  setInputLabel(label) {
    if (!this.fileUploadHeaderInputLabel || label === this.fileUploadHeaderInputLabel.innerHTML) return;
    this.fileUploadHeaderInputLabel.innerHTML = label;
  }

  setInputContainerStatus(status) {
    if (status === 'default') {
      this.inputContainerStyle = '';
    } else if (status === 'dragover') {
      this.inputContainerStyle = 'file-upload__input-container-dragover-style';
    } else if (status === 'dropArea') {
      this.inputContainerStyle = 'file-upload__input-container-drop-area-style';
    } else if (status === 'fail') {
      this.inputContainerStyle = 'file-upload__input-container-fail-style';
      setTimeout(() => this.setInputContainerStatus('default'), 2000);
    }
  }

  isFileUploaded(file) {
    for (let i = 0; i < this.files.length; i++) {
      if (this.files[i].name === file.name && this.files[i].size === file.size) return true;
    }
    return false;
  }

  alertInvalidFileType() {
    this.setInputLabel('File type not supported');
    this.setInputContainerStatus('fail');
    setTimeout(() => this.setInputLabel(this.description), 2000);
  }

  alertDuplicateInsertAttempt() {
    this.setInputLabel('File is already uploaded');
    this.setInputContainerStatus('fail');
    setTimeout(() => this.setInputLabel(this.description), 2000);
  }

  alertSuccessfulUpload() {
    this.setInputLabel('Upload completed');
    setTimeout(() => this.setInputContainerStatus('default'), 2000);
    setTimeout(() => this.setInputLabel(this.description), 2000);
  }
}
