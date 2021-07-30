import { bindable } from 'aurelia-framework';

export class Console {

  @bindable
  disable;

  /**
   * items are type of object with at least two attributes: id and text
   */
  messages = [];

  attached(){
    this.messages.push({text: "This is a test!"});
    this.messages.push({text: "This is a test!"});
  }
}
