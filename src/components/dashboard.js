import { bindable, inject } from "aurelia-framework";
import { ViewModelProvider } from "../view-models/view-model-provider";
import { EventAggregator } from "aurelia-event-aggregator";

@inject(ViewModelProvider, EventAggregator)
export class Dashboard {
  @bindable
  expansionMode;

  viewModelProvider;
  appVM;

  // Properties for events
  eventAggregator;
  logsViewSubscriber;

  /**
   * List of active view options: agents-view, logs-view, files-view
   */
  @bindable
  activeView;

  constructor(viewModelProvider, eventAggregator) {
    this.eventAggregator = eventAggregator;
    this.viewModelProvider = viewModelProvider;
    this.appVM = this.viewModelProvider.getAppVM();
    this.eventAggregator = eventAggregator;
    this.logsViewSubscriber = this.eventAggregator.subscribe(
      "openLogsView",
      (param) => {
        this.activeView = "logs-view";
      }
    );
  }

  expansionModeChanged() {}

  activeViewChanged() {}
}
