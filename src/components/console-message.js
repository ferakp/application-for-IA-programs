import { bindable } from "aurelia-framework";

export class ConsoleMessage {
  
  @bindable
  message;

  _id;
  _text;

  attached(){
    this._text = this.message.text;
  }


}
