import { bindable } from 'aurelia-framework';

export class Console {

  @bindable
  disable;

  /**
   * items are type of object with at least two attributes: id and text
   */
  messages = [];

  attached(){
  }
}
