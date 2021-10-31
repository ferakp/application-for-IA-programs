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
      if (this.perceptions.length > 0) {
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
    this.agents.forEach(e => {
      if (e.id === agentId) e.terminate();
    });
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
   * Type 0 agent has structure of [id, target, [rule](2), action]
   * Type 1 agent has structure of [id, target, [rule](3), action]
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

  agentProgramState = 'idle';
  executionCycleInterval;

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
      if (this.parseRules(response.filter(e => e).map(e => e.trim()))) {
        this.state = 'initialized';
        this.log('Rules have been extracted', null);
      } else this.state = 'error';
    } else if (state === 'run') {
      if (this.state !== 'initialized') {
        this.log('Unable to run ' + this.name + " - Agent hasn't been initialized yet", 'Not initialized');
        return;
      }
      this.state = 'running';
      this.log('Running ' + this.name, null);
      this.executionCycleInterval = setInterval(() => {
        if (this.agentProgramState === 'idle') this.runAgentProgram();
        if (this.state !== 'running') {
          clearInterval(this.executionCycleInterval);
        }
      }, 3000);
    }
  }

  terminate() {
    clearInterval(this.executionCycleInterval);
  }

  addPerceptions(perceptions) {
    // Convert perceptions type to Array
    if (!Array.isArray(perceptions)) {
      perceptions = [perceptions];
    }

    // Add perception time
    perceptions.forEach(e => e.push(new Date()));

    // Add recently perceived perceptions to perceptions array
    if (this.state === 'running') this.perceptions = this.perceptions.concat(perceptions);
  }

  runAgentProgram() {
    if (this.perceptions.length === 0) return;
    this.agentProgramState = 'busy';
    if (this.type === 0) {
      this.perceptions.forEach(p => this.executeReflexAgentProgram(p));
      this.perceptions = [];
    } else if (this.type === 1) {
      this.executeModelReflexAgentProgram(this.processedPerceptions.concat(this.perceptions));
      this.processedPerceptions = this.processedPerceptions.concat(this.perceptions);
      this.perceptions = [];
    } else if (this.type === 2) {
      if (this.ruleActionList.length !== 1) {
        this.log('The goal-based agent must have only one goal', 'Only 1 goal is allowed');
        return;
      }
      this.executeGoalAgentProgram(this.processedPerceptions.concat(this.perceptions));
      this.processedPerceptions = this.processedPerceptions.concat(this.perceptions);
      this.perceptions = [];
    } else if (this.type === 3) {
      this.executeUtilityAgentProgram(this.processedPerceptions.concat(this.perceptions));
      this.processedPerceptions = this.processedPerceptions.concat(this.perceptions);
      this.perceptions = [];
    }
    this.agentProgramState = 'idle';
  }

  /**
   *
   * @param {Array} perception [id, target, value]
   */
  executeReflexAgentProgram = perception => {
    this.ruleActionList.forEach(ruleAction => {
      if (perception[0] === ruleAction[0].toString() && perception[1].toLowerCase() === ruleAction[1].toString().toLowerCase() && this.executeOperation([perception], ruleAction[2])) {
        this.log('ACTION ' + ruleAction[3] + ' HAS BEEN ACTIVATED', null, true);
      }
    });
  };

  executeModelReflexAgentProgram = perceptions => {
    let filteredPerceptions = [];

    // Phase 1 - Format perceptions
    perceptions = perceptions.map(e => {
      e[0] = e[0].toString().toLowerCase();
      e[1] = e[1].toString().toLowerCase();
      e[2] = e[2].toString().toLowerCase();
      return e;
    });

    // Phase 2 - Store only those perceptions the rule(s) need
    this.ruleActionList.forEach(ruleAction => {
      let correctPerceptions = perceptions.filter(p => p[0] === ruleAction[0].toString() && p[1] === ruleAction[1].toLowerCase());
      correctPerceptions.forEach(p => {
        if (!filteredPerceptions.some(e => e[0] + e[1] + e[2] + e[3].getTime() === p[0] + p[1] + p[2] + p[3].getTime())) {
          filteredPerceptions.push(p);
        }
      });
    });

    // Phase 3 - Execute operations on stored perceptions
    this.ruleActionList.forEach(ruleAction => {
      let ruleSpecificPerceptionValues = filteredPerceptions.filter(e => e[0] + e[1] === ruleAction[0].toString() + ruleAction[1].toString().toLowerCase());
      if (this.executeOperation(ruleSpecificPerceptionValues, ruleAction[2])) {
        this.log('ACTION ' + ruleAction[3] + ' HAS BEEN ACTIVATED', null, true);
      }
    });
  };

  executeGoalAgentProgram = perceptions => {
    this.ruleActionList.forEach(ruleAction => {
      let ruleSpecificPerceptions = perceptions.filter(e => e[0] + e[1] === ruleAction[0].toString() + ruleAction[1].toString().toLowerCase());
      let action;
      let lastPerception;

      if (ruleSpecificPerceptions.length > 0) lastPerception = ruleSpecificPerceptions[ruleSpecificPerceptions.length - 1];
      else return;

      if (parseFloat(lastPerception[2]) < ruleAction[2][1]) {
        action = ruleAction[3][0];
      } else if (parseFloat(lastPerception[2]) > ruleAction[2][1]) {
        action = ruleAction[3][1];
      } else {
        action = 'ready';
      }

      if (action === 'ready') {
        this.log(this.name + ' HAS REACHED ITS GOAL', null, true);
        this.state = 'ready';
      } else {
        this.log('ACTION ' + action + ' HAS BEEN ACTIVATED', null, true);
      }
    });
  };

  executeUtilityAgentProgram = perceptions => {
    this.ruleActionList.forEach(ruleAction => {
      let ruleSpecificPerceptions = perceptions.filter(e => e[0] + e[1] === ruleAction[0].toString() + ruleAction[1].toString().toLowerCase());
      let action;
      let lastPerception;

      if (ruleSpecificPerceptions.length > 1) lastPerception = ruleSpecificPerceptions[ruleSpecificPerceptions.length - 1];
      else return;

      if (parseFloat(lastPerception[2]) < ruleAction[2][1]) {
        action = ruleAction[3][0];
      } else if (parseFloat(lastPerception[2]) > ruleAction[2][1]) {
        action = ruleAction[3][1];
      } else {
        action = 'ready';
      }

      // If a new sensor value exceeds the rule's value it should wait for another perception
      if (Math.abs(ruleAction[2][1] - lastPerception[2]) < Math.abs(lastPerception[2] - ruleSpecificPerceptions[ruleSpecificPerceptions.length - 2][2])) {
        return;
      }
      if (!(Math.abs(ruleAction[2][1] - lastPerception[2]) < Math.abs(ruleAction[2][1] - ruleSpecificPerceptions[ruleSpecificPerceptions.length - 2][2]))) {
        return;
      }

      if (action === 'ready') {
        this.log(this.name + ' HAS REACHED ITS GOAL', null, true);
        this.state = 'ready';
      } else {
        this.log('ACTION ' + action + ' HAS BEEN ACTIVATED', null, true);
      }
    });
  };

  /**
   * Executes operation on perceptions
   * @param {Array} perceptions perceptions [id, target, value, time]
   * @param {string} rule [operator, value]
   */
  executeOperation = (perceptions, rule) => {
    if (this.type === 0) {
      return this.executeOperationsForReflexAgent(perceptions, rule);
    } else if (this.type === 1) {
      return this.executeOperationsForModelReflexAgent(perceptions, rule);
    } else if (this.type === 2) {
      console.log(perceptions, rule);
    }
  };

  executeOperationsForGoalAgent = (perceptions, rule) => {};

  executeOperationsForReflexAgent = (perceptions, rule) => {
    let value = perceptions[0][2];
    if (rule[0] === '<') return this.isSmaller(value, rule[1]);
    else if (rule[0] === '>') return this.isLarger(value, rule[1]);
    else if (rule[0] === '=') return this.isEqual(value, rule[1]);
    else return false;
  };

  executeOperationsForModelReflexAgent = (perceptions, rule) => {
    // Perceptions that match with the instruction rule
    let matchingPerceptions = [];

    // Add perceptions matching with the instruction rule to matchingPerceptions
    for (let i = perceptions.length - 1; i > -1; i--) {
      let value = perceptions[i][2];
      let response = false;
      if (rule[0] === '<') response = this.isSmaller(value, rule[1]);
      else if (rule[0] === '>') response = this.isLarger(value, rule[1]);
      else if (rule[0] === '=') response = this.isEqual(value, rule[1]);
      if (response) matchingPerceptions.unshift(perceptions[i]);
      else break;
    }

    // Checks for time requirement
    if (matchingPerceptions.length > 1 || (matchingPerceptions.length > 0 && rule[2] === 0)) {
      if (rule[2] === 0 || matchingPerceptions[matchingPerceptions.length - 1][3] - matchingPerceptions[0][3] >= rule[2]) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  };

  isSmaller(value, compValue) {
    if (parseFloat(value) < parseFloat(compValue)) return true;
    else return false;
  }

  isLarger(value, compValue) {
    if (parseFloat(value) > parseFloat(compValue)) return true;
    else return false;
  }

  isEqual(value, compValue) {
    if (parseFloat(value) === parseFloat(compValue)) return true;
    else return false;
  }

  parseRules = rules => {
    if (!this.isRulesValid(rules)) {
      this.log('Unable to parse rules from the file. Invalid syntax.', 'Invalid syntax');
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

      if ([id, target, rule, action].includes(false)) {
        this.reportInvalidAttributeValue(e);
        response = false;
      } else {
        formattedRule.push(...[id, target, rule, action]);
      }
      this.ruleActionList.push(formattedRule);
    });
    return response;
  };

  reportInvalidAttributeValue(e) {
    this.log('Unable to register a rule - Invalid attribute value(s) - Invalid row : ' + e, 'Invalid attribute values');
    this.log('Check documentation for the syntax of ' + ['Reflex', 'Model-based reflex', 'Goal-based', 'Utility-based'][this.type] + ' agent rules', 'Invalid attribute values');
  }

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
    if (this.type === 0 && this.containsElement(value, ['<', '>', '='])) {
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
    } else if (this.type === 2 || this.type === 3) {
      let answer;
      if (value.includes('<') || value.includes('>')) return false;
      else {
        if (value.includes('=')) answer = ['=', parseFloat(value.replace('=', ''))];
        else answer = ['=', parseFloat(value)];
      }
      if (!isNaN(answer[1])) return answer;
      else return false;
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
        if (ruleSplitted[5].includes('<') || ruleSplitted[5].includes('>') || ruleSplitted[5].includes('=')) answer = false;
      });
    } else if (ruleType === 3) {
      rules.forEach(e => {
        let ruleSplitted = e.split(' ');
        if (ruleSplitted.length !== 8) answer = false;
        if (!(ruleSplitted[0] === 'ID' && ruleSplitted[2] === 'TARGET' && ruleSplitted[4] === 'RULE' && ruleSplitted[6] === 'ACTION')) answer = false;
        if (ruleSplitted[5].includes('<') || ruleSplitted[5].includes('>') || ruleSplitted[5].includes('=')) answer = false;
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

  log = (message, errorMessage, isAction) => {
    if (errorMessage) this.appVMApi.log(message, this.id, { response: false, errorMessage: errorMessage, isAction: isAction });
    else this.appVMApi.log(message, this.id, { response: true, errorMessage: '', isAction: isAction });
  };

  agentIsNotInitialized = () => {
    this.log("Interrupting agent program execution as it hasn't been initialized yet", 'Interruption, agent is not initialized');
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
    else this.status = {};
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
