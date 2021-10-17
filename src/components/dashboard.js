import { bindable, inject } from "aurelia-framework";
import { ViewModelProvider } from "../view-models/view-model-provider";

@inject(ViewModelProvider)
export class Dashboard {
  @bindable
  expansionMode;

  viewModelProvider;
  appVM;

  constructor(viewModelProvider) {
    this.viewModelProvider = viewModelProvider;
    this.appVM = this.viewModelProvider.getAppVM();
  }

  /**
   * List of active view options: agent, log, files
   */
  @bindable
  activeView;

  expansionModeChanged() {}

  activeViewChanged() {}
}
