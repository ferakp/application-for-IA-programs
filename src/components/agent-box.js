import { bindable, inject } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';

@inject(EventAggregator)
export class AgentBox {
  @bindable
  agent;
  agentTypeFormatted;

  // Combobox properties
  states = ['initializing', 'initialized', 'running', 'ready'];
  customFilter = (v, i) => i;

  // Injections
  eventAggregator;

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

  openLogHistory() {
    this.eventAggregator.publish('openLogsView', this.agent.id);
  }
}
