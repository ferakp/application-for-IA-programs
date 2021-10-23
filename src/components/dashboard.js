import { bindable, inject } from 'aurelia-framework';
import { ViewModelProvider } from '../view-models/view-model-provider';
import { EventAggregator } from 'aurelia-event-aggregator';
import { Interpreter } from '../interpreter/interpreter';

@inject(ViewModelProvider, EventAggregator, Interpreter)
export class Dashboard {
  // Controller for adjusting window size (console)
  @bindable
  expansionMode;

  viewModelProvider;
  appVM;

  // Properties for event handling
  eventAggregator;
  logsViewSubscriber;

  // List of active view options: Agents-view, Logs-view, Files-view
  @bindable
  activeView = 'Agents-view';

  // Logs view
  logsViewFilters = [];

  interpreter;
  lastTlCheckIndex = -1;

  constructor(viewModelProvider, eventAggregator, interpreter) {
    this.interpreter = interpreter;
    this.eventAggregator = eventAggregator;
    this.viewModelProvider = viewModelProvider;
    this.appVM = this.viewModelProvider.getAppVM();
    this.eventAggregator = eventAggregator;
    this.logsViewSubscriber = this.eventAggregator.subscribe('openLogsView', agentId => {
      this.logsViewFilters.push('Agent ID: ' + agentId);
      this.activeView = 'Logs-view';
    });
    setInterval(() => this.runInterpreter(), 1000);
  }

  expansionModeChanged() {}

  activeViewChanged(newValue) {
    if (newValue && newValue !== 'Logs-view') this.logsViewFilters = [];
  }

  runInterpreter = () => {
    if (this.interpreter) {
      for (let i = 0; i < this.appVM.terminalLines.length; i++) {
        if (i > this.lastTlCheckIndex) this.appVM.terminalLines[i].status = this.interpreter.interpret(this.appVM.terminalLines[i].text)[0];
      }
      this.lastTlCheckIndex = this.appVM.terminalLines.length-1;
    }
  };
}
