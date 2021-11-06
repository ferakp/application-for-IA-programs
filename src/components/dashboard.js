import { bindable, inject } from 'aurelia-framework';
import { ViewModelProvider } from '../view-models/view-model-provider';
import { EventAggregator } from 'aurelia-event-aggregator';
import { Interpreter } from '../interpreter/interpreter';
import { CustomFileReader } from '../custom-file-reader/custom-file-reader';

/**
 * A class (view model) for dashboard component
 * 
 * Aurelua autoinjects:
 * ViewModelProvider for creating a new view model
 * EventAggregator instance for sending and receiving events
 * Interpreter instance for interpreting console commands
 * CustomFileReader instance for reading files
 */
@inject(ViewModelProvider, EventAggregator, Interpreter, CustomFileReader)
export class Dashboard {
  // Controller for adjusting window size (console)
  @bindable
  expansionMode;

  // Provides view model
  viewModelProvider;
  // View model for entire dashboard page
  appVM;

  // Properties for handling events
  eventAggregator;
  logsViewSubscriber;
  filesViewSubscribe;

  // Active view - Options [Agents-view, Logs-view, Files-view]
  @bindable
  activeView = 'Agents-view';

  // Logs view
  logsViewFilters = [];

  interpreter;
  lastTlCheckIndex = -1;
  interpreterInterval;

  fileReader;

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
    this.interpreterInterval = setInterval(() => this.runInterpreter(), 500);
    this.initialize();
  }

  destroy() {
    if (this.interpreterInterval) clearInterval(this.interpreterInterval);
  }

  initialize() {
    if (this.viewModelProvider) this.appVM = this.viewModelProvider.getAppVM();
    if (this.interpreter) this.interpreter.setAppVM(this.appVM);
    if (this.appVM) this.appVM.registerFileReader(this.fileReader);
  }

  activeViewChanged(newValue) {
    if (newValue && newValue !== 'Logs-view') this.logsViewFilters = [];
  }

  /**
   * This function is called every 0.5 second
   * Checks console messages that have been written and interprets them using interpreter instance
   * The error message of invalid commands are printed after invalid command
   */
  runInterpreter = () => {
    if (this.interpreter) {
      for (let i = 0; i < this.appVM.terminalLines.length; i++) {
        try {
          if (i > this.lastTlCheckIndex) {
            // Skips if isResponse is true - then it's not an instruction
            if (this.appVM.terminalLines[i].isResponse) continue;
            // Reponse is an array with two indices (response, errorMessage)
            let response = this.interpreter.interpret(this.appVM.terminalLines[i].text);
            this.appVM.terminalLines[i].status = { response: response[0], errorMessage: response[1] };
            if (response[1]) this.dashboardConsole.createGenericTerminalLine({ text: response[1], isResponse: true })
          }
        } catch (err) {
          console.log(err);
        }
      }
      this.lastTlCheckIndex = this.appVM.terminalLines.length - 1;
    }
  };

}
