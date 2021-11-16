import { Agent } from './agent-vm';
import { Log } from './log-vm';

/**
 *  AppVM is a view model class for entire application
 *  Once application is initialized Aurelia creates a single AppVM instance
 *
 *  AppVM is also used to controlling user interface components
 *  Agents is binded to agent-view and logs is binded to logs-view
 *
 *  See the documentation for further details
 */
export class AppVM {
  // An array of agents
  agents = [];

  //An array for storing logs with following structure: text, id, time, color and producer
  logs = [];

  // An array of files with a type of File (HTML)
  files = [];

  // An instance of FileReader class
  fileReader;

  // An object for passing anonymous functions for agents
  _appVMApi;

  // An array of TerminalLine instances with following fields: id, text, time, color, status and isResponse
  terminalLines = [];

  /**
   * Array for storing global perceptions
   * An array of arrays with following structure [id, generate, perception, target, value]
   */
  perceptions = [];
  // Processed perceptions are the perceptions that have been shared among agents
  processedPerceptions = [];

  /**
   * UTILITY PROPERTIES
   */

  _perceptionCheckInterval;

  constructor() {
    this._appVMApi = { deleteAgent: this.deleteAgent, logs: this.logs, fileReader: this.fileReader, log: this.log };

    // Interval for checking recently added perceptions
    this._perceptionCheckInterval = setInterval(() => {
      if (this.perceptions.length > 0) {
        this.agents.forEach(a => a.addPerceptions(this.perceptions));
        this.processedPerceptions.concat(this.perceptions);
        this.perceptions = [];
      }
    }, 1000);
  }

  // Closes open listeners and intervals
  destroy() {
    clearInterval(this._perceptionCheckInterval);
    this.agents.forEach(a => a.terminate());
  }

  // Registers FileReader instance
  registerFileReader = fileReader => {
    if (fileReader) {
      this.fileReader = fileReader;
      this._appVMApi.fileReader = this.fileReader;
    }
  };

  /**
   * Deletes agent with given id
   * @param {number} agentId
   */
  deleteAgent = agentId => {
    this.agents.forEach(e => {
      if (e.id === agentId) e.terminate();
    });
    if (this.agents.length > 0) this.agents = this.agents.filter(e => e.id !== agentId);
  };

  /**
   * Creates a new agent with given type and file
   * Add created agent to the agent's array
   * @param {integer} type 
   * @param {File} file 
   */
  createAgent = (type, file) => {
    let agent = new Agent(this._appVMApi, type, file, null);
    this.agents.push(agent);
    this.logs.push(new Log('A new agent has been created \n with a producer ID (Agent ID) of ' + agent.id, null, null, null, { id: agent.id }));
  };

  /**
   * Creates a new log message
   * @param {string} message message
   * @param {number} producerId id of agent
   * @param {Object} status object with response and errorMessage value
   */
  log = (message, producerId, status) => {
    this.logs.push(new Log(message, null, null, null, { id: producerId || 'N/A' }, status));
  };

  /**
   *  Creates a new terminal line
   * @param {string} text content
   * @param {boolean} isResponse is terminal line independent or response to previous one
   */
  createTerminalLine = (text, isResponse) => {
    this.terminalLines.push({ text: text, isResponse: isResponse });
  };
}
