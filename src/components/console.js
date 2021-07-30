import { bindable } from 'aurelia-framework';

export class Console {

  @bindable
  disable;

  /**
   * items are type of object with at least two attributes: id and text
   */
  messages = [];

  attached(){
    this.messages.push({text: "This is a test.", color: "red"});
    this.messages.push({text: "This message should be distinguished with green sign.", color: "green"});
    this.messages.push({text: "This is a message with blue color.", color: "blue"});
  }
}
