import { bindable } from "aurelia-framework";

export class FileUpload {
  @bindable
  label;

  @bindable
  description;

  @bindable
  files;

  inputStyle = "file-upload__input-container-default-style";

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
      this.dragOutside(true);
      this.setInputContainerStatus("dragover");
    });

    document.querySelector("html").addEventListener("drop", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.dragOutside(false);
      this.setInputContainerStatus("default");
    });

    // Drag enter
    this.fileUploadHeaderInputContainer.addEventListener("dragenter", (e) => {
      e.stopPropagation();
      e.preventDefault();
      this.dragInside(true);
      this.setInputContainerStatus("dropArea");
      console.log("started");
    });

    // Drag over
    this.fileUploadHeaderInputContainer.addEventListener("dragover", (e) => {
      e.stopPropagation();
      e.preventDefault();
      this.dragInside(true);
    });

    // Drop
    this.fileUploadHeaderInputContainer.addEventListener("drop", (e) => {
      e.stopPropagation();
      e.preventDefault();
      this.dragInside(false);
      let file = e.dataTransfer.files[0];
      if (Array.isArray(this.files) && file) {
        this.files.push(file);
        this.setInputContainerStatus("uploaded");
        setTimeout(() => this.setInputContainerStatus("default"), 1000);
      }
    });
  }

  dragOutside = (status) => {
    if (status) {
      if (this.fileUploadHeaderInputLabel) {
        this.fileUploadHeaderInputLabel.innerHTML = "Drag it here..";
      }
    } else {
      if (this.fileUploadHeaderInputLabel)
        this.fileUploadHeaderInputLabel.innerHTML = this.description;
    }
  };

  dragInside = (status) => {
    if (status) {
      if (this.fileUploadHeaderInputLabel)
        this.fileUploadHeaderInputLabel.innerHTML = "Drop";
    } else {
      if (this.fileUploadHeaderInputLabel) {
        this.fileUploadHeaderInputLabel.innerHTML = "Uploaded";
        setTimeout(() => {
          this.fileUploadHeaderInputLabel.innerHTML = this.description;
        }, 1000);
      }
    }
  };

  receiveFiles = () => {
    if (this.fileUploadInput) {
      if (!Array.isArray(this.files)) this.files = [];
      if (Array.isArray([...this.fileUploadInput.files]))
        [...this.fileUploadInput.files].forEach((file) =>
          this.files.push(file)
        );
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
    } else if (status === "success") {
      this.inputContainerStyle = "file-upload__input-container-success-style";
    }
  }
}
