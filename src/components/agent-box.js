import { bindable } from "aurelia-framework";

export class AgentBox {
  @bindable
  agent;

  agentTypeFormatted;

  attached() {
    if(this.agent.type === 0) this.agentTypeFormatted = "Reflex agent";
    if(this.agent.type === 1) this.agentTypeFormatted = "Model-based reflex agent";
    if(this.agent.type === 2) this.agentTypeFormatted = "Goal-based agent";
    if(this.agent.type === 3) this.agentTypeFormatted = "Utility-based agent";
  }
}
