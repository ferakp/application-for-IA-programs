import { bindable } from "aurelia-framework";

export class TerminalLine {
  
  @bindable
  terminalLine;

  _id;
  _text;
  _color;

  attached(){
    this._text = this.terminalLine.text;
    this._time = this.terminalLine.time;
    this._color = this.terminalLine.color;
  }


}
