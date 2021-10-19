export class AppVM {
  agents = [];
  activeAgents = [];
  terminatedAgents = [];
  api;
  logs;

  constructor() {
    this.api = { deleteAgent: this.deleteAgent };
    this.agents.push(new Agent(this.api, 0));
  }

  deleteAgent = (agentId) => {
    if (this.agents.length > 0)
      this.agents = this.agents.filter((e) => e.id !== agentId);
  };
}

class Agent {
  id;
  name;
  /**
   * 0 - reflex agent
   * 1 - model-based reflex agent
   * 2 - goal-based agent
   * 3 - utility agent
   */
  type;

  // Only if agent's type is 0 and 1
  ruleActionMap;

  // Only if agent's type is 1
  observations;

  // Only if agent's type is 3
  utilityFunction;

  // Status - uninitialized, initialized, idle, running, terminated, paused
  status = "running";

  startTime = "N/A";

  pausedTime = "N/A";

  endingTime = "N/A";

  appVMApi;

  constructor(appVMApi, type, name) {
    this.appVMApi = appVMApi;
    this.type = type;
    if (type === 0) this.ruleActionMap = new Map();
    if (type === 1) this.observations = [];

    this.name = name || "Agent_" + Math.floor(Math.random() * 1000000);
    this.id = Math.floor(Math.random() * 10000000000000);
  }

  delete() {
    this.appVMApi.deleteAgent(this.id);
  }
}
