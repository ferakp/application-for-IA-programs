import { inject, bindable } from 'aurelia-framework';

export class Checkbox {
  @bindable
  name;

  @bindable
  checked;

  @bindable
  errorMessage;

  isAttached = false;

  attached() {
    this.isAttached = true;
  }
}
