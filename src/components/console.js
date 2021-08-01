import { bindable } from "aurelia-framework";

export class Console {
  @bindable
  disable;

  /**
   * items are type of object with at least two attributes: id and text
   */
  messages = [];

  attached() {
    // Test
    this.messages.push({
      text: "This is just a test.",
      color: "red",
      time: this._getFullDate(),
    });
    this.messages.push({
      text: "This message has a green row-sign.",
      color: "green",
      time: this._getFullDate(),
    });
    this.messages.push({
      text: "This is a message with blue color row-sign.",
      color: "blue",
      time: this._getFullDate(),
    });
  }

  _getFullDate() {
    let date = new Date();
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
