import { bindable } from 'aurelia-framework';

export class TerminalLine {
  @bindable
  terminalLine;

  @bindable
  deleteTerminalLineCallback;

  @bindable
  openInfoCallback;

  @bindable
  logMode = false;

  _successfulRun = false;
  _errorMessage;
  _id;
  _text;
  _color;
  _isResponse = false;
  _isAction = false;

  errorMessageInterval;

  attached() {
    if(this._isObjectEmpty(this.terminalLine)) return;
    this._text = this.terminalLine.text;
    this._time = this._formatTime(this.terminalLine.time);
    this._color = this.terminalLine.color;
    this._id = this.terminalLine.id;
    this._isResponse = this.terminalLine.isResponse;
    if (this.logMode) this._color = 'rgb(124 124 124 / 80%)';
    this.errorMessageInterval = setInterval(() => {
      if (this.terminalLine.status.errorMessage) this._errorMessage = this.terminalLine.status.errorMessage;
      else this._successfulRun = true;
      if (this.terminalLine.status.isAction) this._isAction = true;
      clearInterval(this.errorMessageInterval);
    }, 1000);
  }

  _isObjectEmpty(obj){
    let isEmpty = true;
    for (let key in obj) {
      isEmpty = false;
      break;
    }
    return isEmpty;
  }

  _formatTime(date) {
    if (date && Object.getPrototypeOf(date).constructor.name === 'Date') {
      let prefixMinutes = '0';
      let prefixHours = '0';
      if (date.getHours() > 9) prefixHours = '';
      if (date.getMinutes() > 9) prefixMinutes = '';
      return date.getDate() + '.' + (date.getMonth() + 1) + '.' + date.getFullYear() + ' ' + +prefixHours + date.getHours() + ':' + prefixMinutes + date.getMinutes();
    }
  }

  _deleteLine() {
    if (this.deleteTerminalLineCallback) this.deleteTerminalLineCallback(this._id);
  }

  _openInfo() {
    if (this.openInfoCallback) this.openInfoCallback(this._id);
  }

  isResponse = () => {
    return this._isResponse;
  }
}
