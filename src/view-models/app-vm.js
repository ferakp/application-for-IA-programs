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
    this._appVMApi = { deleteAgent: this.deleteAgent, logs: this.logs, fileReader: this.fileReader, log: this.log };

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
    this.logs.push(new Log('A new agent has been created \n with producer ID (Agent ID) of ' + agent.id, null, null, null, { id: agent.id }));
  };

  log = (message, producerId) => {
    this.logs.push(new Log(message, null, null, null, { id: producerId }));
  };

  createTerminalLine = (text, isResponse) => {
    this.terminalLines.push({text: text, isResponse: isResponse})
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

  // perceptions
  perceptions;

  // Only if agent's type is 3
  utilityFunction;

  // Status - initializing, initialized, running, ready
  state = 'initializing';

  startTime = 'N/A';

  pausedTime = 'N/A';

  endingTime = 'N/A';

  file;

  appVMApi;

  constructor(appVMApi, type, file, name) {
    this.file = file;
    this.appVMApi = appVMApi;
    this.type = type;
    if (type === 0) this.ruleActionMap = new Map();
    if (type === 1) this.perceptions = [];

    this.name = name || 'Agent_' + Math.floor(Math.random() * 1000000);
    this.id = Math.floor(Math.random() * 10000000000000);
    this.changeState('initialize');
  }

  async changeState(state) {
    if (state === 'initialize') {
      this.appVMApi.log('Initializing ' + this.name, this.id);
      let { response, errorMessage } = await this.appVMApi.fileReader.readFile(this.file);
      if (Array.isArray(response)) {
        this.perceptions = [];
        response.forEach(e => this.perceptions.push(e));
        this.appVMApi.log(this.name + ' has been initialized. ' + this.perceptions.length + ' perceptions have been extracted from the file ' + this.file.name, this.id);
        this.state = 'initialized';
      }
    }
    if (state === 'run') {
      this.appVMApi.log('Running ' + this.name, this.id);

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
