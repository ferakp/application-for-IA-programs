import { bindable } from "aurelia-framework";

export class TerminalLine {
  @bindable
  terminalLine;

  @bindable
  deleteTerminalLineCallback;

  _id;
  _text;
  _color;

  attached() {
    this._text = this.terminalLine.text;
    this._time = this._formatWave(this.terminalLine.time);
    this._color = this.terminalLine.color;
    this._id = this.terminalLine.id;
  }

  _formatWave(date) {
    const tempDate =
      date.getDate() +
      "." +
      (date.getMonth() + 1) +
      "." +
      date.getFullYear() +
      " " +
      date.getHours() +
      ":" +
      date.getMinutes();
    return tempDate;
  }

  _deleteLine() {
    if (this.deleteTerminalLineCallback)
      this.deleteTerminalLineCallback(this._id);
  }
}
