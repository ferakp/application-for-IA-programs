import { bindable, inject } from 'aurelia-framework';
import { ViewModelProvider } from '../view-models/view-model-provider';
import { EventAggregator } from 'aurelia-event-aggregator';
import { Interpreter } from '../interpreter/interpreter';
import { FileReader } from '../file-reader/file-reader';

@inject(ViewModelProvider, EventAggregator, Interpreter, FileReader)
export class Dashboard {
  // Controller for adjusting window size (console)
  @bindable
  expansionMode;

  viewModelProvider;
  appVM;

  // Properties for event handling
  eventAggregator;
  logsViewSubscriber;
  filesViewSubscribe;

  // List of active view options: Agents-view, Logs-view, Files-view
  @bindable
  activeView = 'Agents-view';

  // Logs view
  logsViewFilters = [];

  interpreter;
  lastTlCheckIndex = -1;

  constructor(viewModelProvider, eventAggregator, interpreter, fileReader) {
    this.interpreter = interpreter;
    this.eventAggregator = eventAggregator;
    this.viewModelProvider = viewModelProvider;
    this.eventAggregator = eventAggregator;
    this.fileReader = fileReader;

    this.logsViewSubscriber = this.eventAggregator.subscribe('openLogsView', agentId => {
      this.logsViewFilters.push('Agent ID: ' + agentId);
      this.activeView = 'Logs-view';
    });
    this.filesViewSubscribe = this.eventAggregator.subscribe('openFilesView', () => {
      this.activeView = 'Files-view';
    });
    setInterval(() => this.runInterpreter(), 1000);
    this.initialize();
  }

  initialize() {
    this.appVM = this.viewModelProvider.getAppVM();
    if (this.interpreter) this.interpreter.setAppVM(this.appVM);
    if (this.appVM) this.appVM.registerFileReader(this.fileReader);
  }

  expansionModeChanged() {}

  activeViewChanged(newValue) {
    if (newValue && newValue !== 'Logs-view') this.logsViewFilters = [];
  }

  runInterpreter = () => {
    if (this.interpreter) {
      for (let i = 0; i < this.appVM.terminalLines.length; i++) {
        try {
          if (i > this.lastTlCheckIndex) {
            let response = this.interpreter.interpret(this.appVM.terminalLines[i].text);
            this.appVM.terminalLines[i].status = response;
          }
        } catch (err) {
          console.log(err);
        }
      }
      this.lastTlCheckIndex = this.appVM.terminalLines.length - 1;
    }
  };
}
