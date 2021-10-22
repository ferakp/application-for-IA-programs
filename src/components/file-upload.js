import { bindable } from "aurelia-framework";

export class FileUpload {
  @bindable
  label;

  @bindable
  description;

  @bindable
  files;

  inputContainerStyle;

  attached() {
    if (this.fileUploadInput) {
      this.fileUploadInput.onchange = () => {
        this.receiveFiles();
      };
    }

    // Prevent redirection during drag and drop mechanism
    document.querySelector("html").addEventListener("dragover", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.setInputLabel("Drag it here!");
      this.setInputContainerStatus("dragover");
    });

    document.querySelector("html").addEventListener("drop", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.setInputLabel(this.description);
      this.setInputContainerStatus("default");
    });

    // Drag enter
    this.fileUploadInputContainer.addEventListener("dragenter", (e) => {
      e.stopPropagation();
      e.preventDefault();
      this.setInputLabel("Drop");
      this.setInputContainerStatus("dropArea");
    });

    // Drag over
    this.fileUploadInputContainer.addEventListener("dragover", (e) => {
      e.stopPropagation();
      e.preventDefault();
      this.setInputLabel("Drop");
    });

    // Drop
    this.fileUploadInputContainer.addEventListener("drop", (e) => {
      e.stopPropagation();
      e.preventDefault();
      let file = e.dataTransfer.files[0];
      if (Array.isArray(this.files) && file) {
        if (!this.isFileUploaded(file)) {
          this.setInputLabel("File has been uploaded!");
          this.files.push(file);
        } else {
          this.setInputLabel("File has been already uploaded!");
          this.setInputContainerStatus("fail");
        } 
        setTimeout(() => this.setInputContainerStatus("default"), 2000);
        setTimeout(() => this.setInputLabel(this.description), 2000);
      }
    });
  }

  setInputLabel(label) {
    if (!this.fileUploadHeaderInputLabel || label === this.fileUploadHeaderInputLabel.innerHTML) return;
    this.fileUploadHeaderInputLabel.innerHTML = label;
  }

  receiveFiles = () => {
    if (this.fileUploadInput) {
      if (!Array.isArray(this.files)) this.files = [];
      for (var i = 0; i < this.fileUploadInput.files.length; i++) {
        this.files.push(this.fileUploadInput.files.item(i));
      }
    }
  };

  openFolderView(event) {
    this.fileUploadInput.click();
  }

  /**
   * UTILITY FUNCTIONS
   */

  setInputContainerStatus(status) {
    if (status === "default") {
      this.inputContainerStyle = "";
    } else if (status === "dragover") {
      this.inputContainerStyle = "file-upload__input-container-dragover-style";
    } else if (status === "dropArea") {
      this.inputContainerStyle = "file-upload__input-container-drop-area-style";
    } else if (status === "fail") {
      this.inputContainerStyle = "file-upload__input-container-fail-style";
    }
  }

  isFileUploaded(file) {
    for (let i = 0; i < this.files.length; i++) {
      if (this.files[i].name === file.name && this.files[i].size === file.size)
        return true;
    }
    return false;
  }
}
