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

  errorMessageInterval;

  attached() {
    this._text = this.terminalLine.text;
    this._time = this._formatTime(this.terminalLine.time);
    this._color = this.terminalLine.color;
    this._id = this.terminalLine.id;
    this._isResponse = this.terminalLine.isResponse;
    if (this.logMode) this._color = 'rgb(124 124 124 / 80%)';
    this.errorMessageInterval = setInterval(() => {
      if (this.terminalLine.status.length > 1) {
        if (this.terminalLine.status[1]) this._errorMessage = this.terminalLine.status[1];
        else this._successfulRun = true;
        clearInterval(this.errorMessageInterval);
      }
    }, 1000);
  }

  _formatTime(date) {
    if (date && Object.getPrototypeOf(date).constructor.name === 'Date')
      return date.getDate() + '.' + (date.getMonth() + 1) + '.' + date.getFullYear() + ' ' + date.getHours() + ':' + date.getMinutes();
  }

  _deleteLine() {
    if (this.deleteTerminalLineCallback) this.deleteTerminalLineCallback(this._id);
  }

  _openInfo() {
    if (this.openInfoCallback) this.openInfoCallback(this._id);
  }
}
