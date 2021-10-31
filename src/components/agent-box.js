import { bindable, inject } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';

@inject(EventAggregator)
export class AgentBox {
  // A reference to agent view model
  @bindable
  agent;
  // Readable agent type
  agentTypeFormatted;
  // An array of possible agent states
  states = ['initializing', 'initialized', 'running', 'ready', 'error'];
  // Custom fitler for combobox component
  customFilter = (v, i) => i;

  constructor(eventAggregator) {
    this.eventAggregator = eventAggregator;
  }

  attached() {
    if (this.agent.type === 0) this.agentTypeFormatted = 'Reflex agent';
    if (this.agent.type === 1) this.agentTypeFormatted = 'Model-based reflex agent';
    if (this.agent.type === 2) this.agentTypeFormatted = 'Goal-based agent';
    if (this.agent.type === 3) this.agentTypeFormatted = 'Utility-based agent';
  }

  deleteAgent() {
    this.agent.delete();
  }

  // Emits event for opening the Logs View
  openLogHistory() {
    this.eventAggregator.publish('openLogsView', this.agent.id);
  }
}
