import { bindable } from 'aurelia-framework';

/**
 * A view model for logs-view component
 * 
 * The logs array is used for storing logs to be printed
 * The filters array is used for storing filters
 */
export class LogsView {
  @bindable
  logs = [];

  /**
   * There are two types of filters
   * Filter 1 - Agent ID: sample 
   * The first filter starts with 'Agent ID:' and then comes actual text to be used for filtering
   * For example Agent ID: 22 will show only logs that are related to the agent with the ID of 22
   * Filter 2 - Text: sample
   * Looks for logs that have such content
   * For example Text: aaa will look for logs in which text aaa appears
   */
  @bindable
  filters = [];

  // Looks for new logs every 2000 seconds
  updateCycleTime = 2000;

  // Variables for comparing old logs and filters with new ones
  
  previousFiltersLength = 0;
  previousLogsLength = 0;

  attached() {
    setInterval(() => {
      this.update();
    }, this.updateCycleTime);
  }

  update() {
    if ((Array.isArray(this.logs) && this.logs.length !== this.previousFiltersLength) || (Array.isArray(this.filters) && this.previousFiltersLength !== this.filters.length)) {
      if (this.previousFiltersLength !== this.filters.length) this.consoleVM.emptyConsole();
      this.logsChanged(this.logs);
      this.previousFiltersLength = this.filters.length;
      this.previousLogsLength = this.logs.length;
    }
  }

  logsChanged(newValue) {
    if (Array.isArray(newValue) && this.consoleVM) {
      newValue.forEach(element => {
        if (Array.isArray(this.filters) && this.filters.length > 0) {
          this.filters.forEach(e => {
            if (e.includes('Agent ID') && element.producer.id.toString() === e.replace('Agent ID: ', '')) this.consoleVM.createGenericTerminalLine(element);
            else if (e.includes('Text: ') && element.text.includes(e.replace('Text: ', ''))) this.consoleVM.createGenericTerminalLine(element);
          });
        } else this.consoleVM.createGenericTerminalLine(element);
      });
    }
  }
}
