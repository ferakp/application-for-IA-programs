import { bindable } from "aurelia-framework";

export class Console {
  @bindable
  disable;

  @bindable
  value;

  @bindable
  inputElement;

  @bindable
  terminalLines;

  @bindable
  disableTextField = false;

  attached() {
    if (!this.terminalLines) this.terminalLines = [];
  }

  createGenericTerminalLine = (payload) => {
    if (typeof payload.text === "string") {
      let terminalLine = {
        text: payload.text,
        time: (payload.time || new Date()),
        id: payload.id || this._getNewId(),
        color: this._getRandomColor(),
      };
      this.terminalLines.push(terminalLine);
    }
  }

  _enterPressed = () => {
    this.terminalLines.push(this._getNewTerminalLine());
    this.value = "";
  };

  _openInfo = (id) => {
    // Open wiki window with given id
  }

  _deleteTerminalLine = (id) => {
    if (typeof id === "number") {
      for (let i = 0; i < this.terminalLines.length; i++) {
        if(id === this.terminalLines[i].id){
          this.terminalLines.splice(i, 1);
          break;
        } 
      }
    }
  };

  _getNewTerminalLine() {
    if (typeof this.value === "string") {
      let terminalLine = {
        text: this.value,
        time: new Date(),
        id: this._getNewId(),
        color: this._getRandomColor(),
      };
      return terminalLine;
    }
  }

  _getNewId() {
    if (this.terminalLines.length > 0)
      return this.terminalLines[this.terminalLines.length - 1].id + 1;
    else return Math.random() * 1000;
  }

  _getRandomColor() {
    let red = 255 * Math.random();
    let green = 255 * Math.random();
    let blue = 255 * Math.random();
    let alpha = Math.random() + 0.2;
    return "rgba(" + red + "," + green + "," + blue + "," + alpha + ")";
  }
}
