import { bindable, inject } from 'aurelia-framework';
import { ViewModelProvider } from '../view-models/view-model-provider';
import { EventAggregator } from 'aurelia-event-aggregator';

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
   * List of active view options: Agents-view, Logs-view, Files-view
   */
  @bindable
  activeView = 'Agents-view';

  logsViewFilters = [];

  constructor(viewModelProvider, eventAggregator) {
    this.eventAggregator = eventAggregator;
    this.viewModelProvider = viewModelProvider;
    this.appVM = this.viewModelProvider.getAppVM();
    this.eventAggregator = eventAggregator;
    this.logsViewSubscriber = this.eventAggregator.subscribe('openLogsView', agentId => {
      this.logsViewFilters.push('Agent ID: ' + agentId);
      this.activeView = 'Logs-view';
    });
  }

  expansionModeChanged() {}

  activeViewChanged(newValue) {
    if (newValue && newValue !== 'Logs-view') this.logsViewFilters = [];
  }
}
