import { bindable } from "aurelia-framework";

export class DashboardMenu {
  @bindable
  menuItemClickedCallback;

  @bindable
  activeView;

  menuItemClicked(name) {
    this.activeView = name;
  }
}
