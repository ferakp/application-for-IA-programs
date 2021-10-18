export class AppVM {

  agents = [];
  activeAgents = [];
  terminatedAgents = [];

  constructor() {
    this.agents.push(new Agent(0));
  }

  
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



  constructor(type, name){
    this.type = type;
    if (type === 0) this.ruleActionMap = new Map(); 
    if ( type === 1) this.observations = [];

    this.name = name || ("Agent_"+Math.floor(Math.random()*1000000));
    this.id = Math.floor(Math.random()*10000000000000);
  }
}
