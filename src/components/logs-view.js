import { bindable } from 'aurelia-framework';

export class LogsView {
  @bindable
  logs = [];

  @bindable
  filters = [];

  updateInterval = 2000;

  // Old states
  previousFiltersLength = 0;
  previousLogsLength = 0;

  attached() {
    setInterval(() => {
      this.update();
    }, this.updateInterval);
  }

  update() {
    if (
      (Array.isArray(this.logs) && this.logs.length !== this.previousFiltersLength) ||
      (Array.isArray(this.filters) && this.previousFiltersLength !== this.filters.length)
    ) {
      if (this.previousFiltersLength !== this.filters.length) this.consoleVM.emptyConsole();
      this.logsChanged(this.logs);
      this.previousFiltersLength = this.filters.length;
      this.previousLogsLength = this.logs.length;
    }
  }

  logsChanged(newValue) {
    if (Array.isArray(newValue) && this.consoleVM) {
      newValue.forEach((element) => {
        if (Array.isArray(this.filters) && this.filters.length > 0) {
          this.filters.forEach((e) => {
            if (e.includes('Agent ID') && element.id.toString() === e.replace('Agent ID: ', '')) this.consoleVM.createGenericTerminalLine(element);
            else if (e.includes('Text: ') && element.text.includes(e.replace('Text: ', ''))) this.consoleVM.createGenericTerminalLine(element);
          });
        } else this.consoleVM.createGenericTerminalLine(element);
      });
    }
  }
}
