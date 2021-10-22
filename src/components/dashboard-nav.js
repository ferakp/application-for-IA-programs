import { bindable } from 'aurelia-framework';

export class DashboardNav {
  @bindable
  disable;

  @bindable
  expand = false;

  _expandWindow = () => {
    if (!this.expand) this.expand = false;
    this.expand = !this.expand;
  };
}
