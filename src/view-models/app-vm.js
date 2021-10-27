export class AppVM {
  /**
   * Agents
   */
  agents = [];

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
  

  /**
   * Global perceptions
   * Perception structure is id value, target value, value value
   */
  perceptions = [];
  processedPerceptions = [];

  constructor() {
    this._appVMApi = { deleteAgent: this.deleteAgent, logs: this.logs, fileReader: this.fileReader, log: this.log };
    setInterval(() => {
      if(this.lastPerceptionIndex !== this.perceptions.length -1) {
        this.agents.forEach(a => a.addPerceptions(this.perceptions));
        this.processedPerceptions.concat(this.perceptions);
        this.perceptions = [];
      }
    }, 1000);

    
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

  log = (message, producerId, status) => {
    this.logs.push(new Log(message, null, null, null, { id: producerId }, status));
  };

  createTerminalLine = (text, isResponse) => {
    this.terminalLines.push({ text: text, isResponse: isResponse });
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

  /**
   * Type 0 agent has structure of [id, target, rule, action]
   */
  ruleActionList = [];

  // perceptions
  perceptions = [];

  processedPerceptions = [];

  goalFunction;

  // Only if agent's type is 3
  utilityFunction;

  // Status - initializing, initialized, running, ready, error
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
        let answer = this.parseRules(response.filter(e => e).map(e => e.trim()));
        if (answer) {
          this.state = 'initialized';
          this.appVMApi.log('Rules have been extracted.', null);
        } 
        else this.state = 'error';
      }
    } else if (state === 'run') {
      this.appVMApi.log('Running ' + this.name, this.id);
    }
  }

  addPerceptions(perceptions) {
    if(this.type === 0) this.parsePerceptions(perceptions);
    else {
      this.perceptions = this.perceptions.concat(perceptions);
      this.parsePerceptions(this.perceptions);
    }
  }

  parsePerceptions(perceptions) {

  }

  parseRules = rules => {
    if (!this.isRulesValid(rules)) {
      this.appVMApi.log('Unable to parse rules from the file. Invalid syntax.', null);
      return false;
    }

    let response = true;
    rules.forEach(e => {
      let splittedRule = e.split(' ');
      let formattedRule = [];

      // formattedValues
      let id = this.parseIdValue(splittedRule[1]);
      let target = this.parseTargetValue(splittedRule[3]);
      let rule = this.parseRuleValue(splittedRule[5]);
      let action = this.parseActionValue(splittedRule[7]);

      console.log(id, target, rule, action);

      if ([id, target, rule, action].includes(false)) {
        this.reportInvalidAttributeValue(e);
        this.response = false;
      } else {
        formattedRule.push(...[id, target, rule, action]);
      }
      this.ruleActionList.push(formattedRule);
    });
    return response;
  };

  reportInvalidAttributeValue(e) {
    this.appVMApi.log('Unable to register a rule. Invalid attribute value(s). Invalid rule : ' + e, null, [false, 'Invalid attribute values']);
    this.appVMApi.log('Check documentation for syntax of ' + ['Reflex', 'Model-based reflex', 'Goal-based', 'Utility-based'][this.type] + ' agent rules', null, [false, 'Invalid attribute values']);
  }

  executeAction = action => {};

  delete() {
    this.appVMApi.deleteAgent(this.id);
  }

  /**
   * UTILITY FUNCTIONS
   */

  /**
   *
   * @param {string} value
   * @returns {Array} action or [əction, action]
   */
  parseActionValue = value => {
    if ((this.type === 0 || this.type === 1) && value.length > 0) {
      return value;
    } else if ((this.type === 2 || this.type === 3) && value.split(':').length === 2) {
      let answer = value.split(':');
      if (answer[0] && answer[1]) return answer;
      else return false;
    } else return false;
  };

  /**
   *
   * @param {string} value
   * @returns {Array} [operator, value, (secondValue)] or false
   */
  parseRuleValue = value => {
    if ((this.type === 0 || this.type === 2 || this.type === 3) && this.containsElement(value, ['<', '>', '='])) {
      let answer;
      if (value.includes('<')) answer = ['<', parseFloat(value.replace('<', ''))];
      else if (value.includes('>')) answer = ['>', parseFloat(value.replace('>', ''))];
      else if (value.includes('=')) answer = ['=', parseFloat(value.replace('=', ''))];
      else return false;
      if (!isNaN(answer[1])) return answer;
      else return false;
    } else if (this.type === 1 && this.containsElement(value, ['<', '>', '=']) && this.containsElement(value, [':']) && value.split(':').length === 2) {
      let answer;
      if (value.includes('<')) answer = ['<', parseFloat(value.split(':')[0].replace('<', '')), parseFloat(value.split(':')[1])];
      else if (value.includes('>')) answer = ['>', parseFloat(value.split(':')[0].replace('>', '')), parseFloat(value.split(':')[1])];
      else if (value.includes('=')) answer = ['=', parseFloat(value.split(':')[0].replace('=', '')), parseFloat(value.split(':')[1])];
      else return false;
      if (isNaN(answer[1]) || isNaN(answer[2])) return false;
      else return answer;
    } else return false;
  };

  /**
   *
   * @param {string} value
   * @returns {Object} value or false
   */
  parseTargetValue = value => {
    if (value === '*') {
      return '*';
    } else if (value.length > 0) {
      return value;
    } else return false;
  };

  /**
   *
   * @param {string} idValue
   * @returns {Object} value or false
   */
  parseIdValue = idValue => {
    if (idValue === '*') {
      return '*';
    } else if (typeof parseFloat(idValue) === 'number') {
      return parseFloat(idValue);
    } else return false;
  };

  isRulesValid = rules => {
    let answer = null;
    let ruleType = this.type;
    // Example ID 001 TARGET TEMPERATURE RULE <22:5 ACTION NOTIFICATION:RED
    if (ruleType === 0) {
      rules.forEach(e => {
        console.log(e);
        let ruleSplitted = e.split(' ');
        if (ruleSplitted.length !== 8) answer = false;
        if (!(ruleSplitted[0] === 'ID' && ruleSplitted[2] === 'TARGET' && ruleSplitted[4] === 'RULE' && ruleSplitted[6] === 'ACTION')) answer = false;
        if (!(ruleSplitted[5].includes('<') || ruleSplitted[5].includes('>') || ruleSplitted[5].includes('='))) answer = false;
      });
    } else if (ruleType === 1) {
      rules.forEach(e => {
        let ruleSplitted = e.split(' ');
        if (ruleSplitted.length !== 8) answer = false;
        if (!(ruleSplitted[0] === 'ID' && ruleSplitted[2] === 'TARGET' && ruleSplitted[4] === 'RULE' && ruleSplitted[6] === 'ACTION')) answer = false;
        if (!(ruleSplitted[5].includes('<') || ruleSplitted[5].includes('>') || ruleSplitted[5].includes('=') || ruleSplitted[5].includes(':'))) answer = false;
      });
    } else if (ruleType === 2) {
      rules.forEach(e => {
        let ruleSplitted = e.split(' ');
        if (ruleSplitted.length !== 8) answer = false;
        if (!(ruleSplitted[0] === 'ID' && ruleSplitted[2] === 'TARGET' && ruleSplitted[4] === 'RULE' && ruleSplitted[6] === 'ACTION')) answer = false;
        if (!(ruleSplitted[5].includes('<') || ruleSplitted[5].includes('>') || ruleSplitted[5].includes('='))) answer = false;
      });
    } else if (ruleType === 3) {
      rules.forEach(e => {
        let ruleSplitted = e.split(' ');
        if (ruleSplitted.length !== 8) answer = false;
        if (!(ruleSplitted[0] === 'ID' && ruleSplitted[2] === 'TARGET' && ruleSplitted[4] === 'RULE' && ruleSplitted[6] === 'ACTION')) answer = false;
        if (!(ruleSplitted[5].includes('<') || ruleSplitted[5].includes('>') || ruleSplitted[5].includes('='))) answer = false;
      });
    } else answer = false;

    if (answer === false) return false;
    if (answer === null) return true;
  };

  containsElement = (value, arr) => {
    let answer = false;
    for (let i = 0; i < arr.length; i++) {
      if (value.includes(arr[i])) answer = true;
    }
    return answer;
  };
}

class Log {
  text = 'N/A';
  id;
  color;
  time;
  status;

  producer;

  constructor(text, id, color, time, producer, status) {
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
    if (status) this.status = status;
    else this.status = [];
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
