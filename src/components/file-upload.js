import { bindable } from "aurelia-framework";

export class FileUpload {
  @bindable
  label;

  @bindable
  description;

  @bindable
  files;

  attached() {
    if (this.fileUploadInput) {
      this.fileUploadInput.onchange = (input) => {
        this.receiveFiles();
      };
    }

    // Prevent redirection during drag and drop mechanism
    document.querySelector("html").addEventListener("dragover", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.dragChanged(true);
    });

    document.querySelector("html").addEventListener("drop", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.dragChanged(false);
    });
  }

  dragChanged = (status) => {
    if (status) {
      if (this.fileUploadHeaderInputLabel)
        this.fileUploadHeaderInputLabel.innerHTML = "Drag it here..";
    } else {
      if (this.fileUploadHeaderInputLabel)
        this.fileUploadHeaderInputLabel.innerHTML = this.description;
    }
  };

  receiveFiles = () => {
    if (this.fileUploadInput) {
      if (Array.isArray(files)) this.files = [];
      this.fileUploadInput.forEach((file) => this.files.push(file));
    }
  };

  openFolderView(event) {
    this.fileUploadInput.click();
  }
}
