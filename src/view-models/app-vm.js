export class AppVM {
  /**
   * Agents
   */
  agents = [];
  activeAgents = [];
  terminatedAgents = [];

  /**
   * Array for storing logs
   * A log is an object with following fields: text, id, time, color and producer
   */
  logs = [];

  /**
   * Array for storing files of type File (HTML)
   */
  files = [];
  fileReader;

  // Functions for agents
  _appVMApi;

  /**
   * Instructions
   * A list of objects with following fields: id, text, time, color and producer
   */
  terminalLines = [];

  constructor() {
    this._appVMApi = { deleteAgent: this.deleteAgent, logs: this.logs, fileReader: this.fileReader };

    /**
     * Samples for tests
     */
    // this.agents.push(new Agent(this._appVMApi, 0, null));
    // this.logs.push(new Log('Test', null, null, null, { id: this.agents[0].id }));
    // this.logs.push(new Log('Another test with another agent ID', null, null, null, { id: 1121001 }));
    // this.logs.push(new Log('Another test with the same agent ID', null, null, null, { id: this.agents[0].id }));
  }

  registerFileReader = fileReader => {
    if (fileReader) {
      this.fileReader = fileReader;
      this._appVMApi.fileReader = this.fileReader;
    }
  };

  deleteAgent = agentId => {
    if (this.agents.length > 0) this.agents = this.agents.filter(e => e.id !== agentId);
  };

  createAgent = (type, file) => {
    let agent = new Agent(this._appVMApi, type, file, null);
    this.agents.push(agent);
    this.logs.push(new Log('A new agent has been created \n Producer (Agent ID) ' + agent.id, null, null, null, { id: agent.id }));
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

  // Status - initializing, running, ready
  status = 'initializing';

  startTime = 'N/A';

  pausedTime = 'N/A';

  endingTime = 'N/A';

  observationFile;

  appVMApi;

  constructor(appVMApi, type, file, name) {
    this.file = file;
    this.appVMApi = appVMApi;
    this.type = type;
    if (type === 0) this.ruleActionMap = new Map();
    if (type === 1) this.observations = [];

    this.name = name || 'Agent_' + Math.floor(Math.random() * 1000000);
    this.id = Math.floor(Math.random() * 10000000000000);
  }

  changeStatus(status) {
    if(status === 'initialized') {

    }
  }

  delete() {
    this.appVMApi.deleteAgent(this.id);
  }
}

class Log {
  text = 'N/A';
  id;
  color;
  time;

  producer;

  constructor(text, id, color, time, producer) {
    if (text) this.text = text;
    else this.text = '';
    if (id) this.id = id;
    else this.id = this.generateNewId();
    if (color) this.color = color;
    else this.color = this.generateRandomColor();
    if (time) this.time = time;
    else this.time = new Date();
    if (producer) this.producer = producer;
    else this.producer = { id: 'N/A' };
  }

  generateNewId() {
    return Math.floor(Math.random() * 10000000542310);
  }

  generateRandomColor() {
    let red = 255 * Math.random();
    let green = 255 * Math.random();
    let blue = 255 * Math.random();
    let alpha = Math.random() + 0.2;
    return 'rgba(' + red + ',' + green + ',' + blue + ',' + alpha + ')';
  }
}
