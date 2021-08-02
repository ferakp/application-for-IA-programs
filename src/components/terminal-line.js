import { bindable } from "aurelia-framework";

export class TerminalLine {
  
  @bindable
  terminalLine;

  _id;
  _text;
  _color;

  attached(){
    this._text = this.terminalLine.text;
    this._time = this._formatWave(this.terminalLine.time);
    this._color = this.terminalLine.color;
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

}
