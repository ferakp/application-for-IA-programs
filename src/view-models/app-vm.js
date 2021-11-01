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

  destroy() {
    clearInterval(this._perceptionCheckInterval);
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

  // Creates a new agent with given type and file containing rules
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

class Agent {
  // Agent ID (number)
  id;
  // Agent name (string)
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
   * Type 2 agent has structure of [id, target, [rule](2), action]
   * Type 3 agent has structure of [id, target, [rule](2), action]
   */
  ruleActionList = [];

  // An array of arrays (perceptions) with the structure of [id, target, value, time]
  perceptions = [];

  // An array of arrays (processed perceptions) for agent type 2, 3 and 4
  processedPerceptions = [];

  // Agent state with following range of values: initializing, initialized, running, ready, error
  state = 'initializing';

  // Time when run began
  startTime = 'N/A';

  // Time when run ended
  endingTime = 'N/A';

  // Uploaded file containing rules - see documentation for syntax
  file;

  // An object containing anonymous functions brought from appVM
  appVMApi;

  /**
   * Agent program state
   * Two possible states: 'idle' and 'busy'
   */
  agentProgramState = 'idle';

  // Interval for running agent program every 3 seconds
  executionCycleInterval;

  constructor(appVMApi, type, file, name) {
    // Initializing properties

    this.file = file;
    this.appVMApi = appVMApi;
    this.type = type;
    this.name = name || 'Agent_' + Math.floor(Math.random() * 1000000);
    this.id = Math.floor(Math.random() * 10000000000000);

    // Start process by changing the agent's state to initializing
    this.changeState('initializing');
  }

  /**
   * FUNCTIONALITIES
   *
   */

  /**
   * This function changes the agent's state to given state
   * initializing state begins processing and extracting rules from the file
   * run state begins to run the agent program
   * @param {string} state new state
   */
  async changeState(state) {
    if (state === 'initializing') {
      // Creates initializing message log
      this.appVMApi.log('Initializing ' + this.name, this.id);
      // Reads rules file
      if (this.file) {
        let { response, errorMessage } = await this.appVMApi.fileReader.readFile(this.file);
      } else {
        this.state = 'error';
        return;
      }
      // Parse rules
      if (this.parseRules(response.filter(e => e).map(e => e.trim()))) {
        this.state = 'initialized';
        this.log('Rules have been extracted', null);
      } else this.state = 'error';
    } else if (state === 'run') {
      if (this.state !== 'initialized') {
        this.log('Unable to run ' + this.name + " - Agent hasn't been initialized yet", 'Not initialized');
      } else {
        this.startTime = this.getFormattedTime(new Date());
        this.state = 'running';
        this.log('Running ' + this.name, null);
        this.executionCycleInterval = setInterval(() => {
          if (this.agentProgramState === 'idle') this.runAgentProgram();
          if (this.state !== 'running') {
            // If state change from running to something else then interval is stopped
            clearInterval(this.executionCycleInterval);
            this.endingTime = this.getFormattedTime(new Date());
          }
        }, 3000);
      }
    }
  }

  // Terminates agent by clearing the interval running the agent program frequently
  terminate() {
    clearInterval(this.executionCycleInterval);
  }

  /**
   * Function for receiving recently perceived (added) perceptions
   * @param {Array} perceptions
   * @returns
   */
  addPerceptions(perceptions) {
    if (this.state === 'running' && perceptions.length > 0) {
      // Add perception time
      perceptions.forEach(e => e.push(new Date()));
      // Store recently perceived perceptions
      this.perceptions = this.perceptions.concat(perceptions);
    }
  }

  /**
   * Runs agent program
   * Reflex agent's program is run from runReflexAgentProgram function
   * Model-based reflex agent's program is run from runModelReflexAgentProgram function
   * Goal-based agent's program is run from runGoalAgentProgram function
   * Utility-based agent's program is run from runUtilityAgentProgram function
   *
   * After running the agent's program the perceptions array is emptied
   */
  runAgentProgram() {
    if (this.perceptions.length === 0) return;
    // Change agent program state to 'busy'
    this.agentProgramState = 'busy';
    if (this.type === 0) {
      this.perceptions.forEach(p => this.runReflexAgentProgram(p));
      this.perceptions = [];
    } else if (this.type === 1) {
      this.runModelReflexAgentProgram(this.processedPerceptions.concat(this.perceptions));
      this.processedPerceptions = this.processedPerceptions.concat(this.perceptions);
      this.perceptions = [];
    } else if (this.type === 2) {
      if (this.ruleActionList.length !== 1) {
        this.log('The goal-based agent must have only one goal', 'Only 1 goal is allowed');
        return;
      }
      this.runGoalAgentProgram(this.processedPerceptions.concat(this.perceptions));
      this.processedPerceptions = this.processedPerceptions.concat(this.perceptions);
      this.perceptions = [];
    } else if (this.type === 3) {
      this.runUtilityAgentProgram(this.processedPerceptions.concat(this.perceptions));
      this.processedPerceptions = this.processedPerceptions.concat(this.perceptions);
      this.perceptions = [];
    }
    // Change agent program state to 'idle'
    this.agentProgramState = 'idle';
  }

  /**
   * An agent program for reflex agent
   * @param {Array} perception Perception array with following elements: id, target, value and time
   */
  runReflexAgentProgram = perception => {
    this.ruleActionList.forEach(ruleAction => {
      if (perception[0] === ruleAction[0].toString() && perception[1].toLowerCase() === ruleAction[1].toString().toLowerCase() && this.executeOperation([perception], ruleAction[2])) {
        this.log('ACTION ' + ruleAction[3] + ' HAS BEEN ACTIVATED', null, true);
      }
    });
  };

  /**
   * An agent program for model-based reflex agent
   * Model-based reflex agent is fitlering perceptions as it's capable of storing perceptions
   * Entire program is run in three phases
   * Model-based reflex agent program compare values of rule and perception and picks correct action if time rule pass
   * @param {Array} perception Perception array with following elements: id, target, value and time
   */
  runModelReflexAgentProgram = perceptions => {
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

  /**
   * An agent program for goal-based agent
   * Goal-based agent program is filtering perceptions before moving to next phases
   * Goal-based agent program compares the perception value to the rule's value and then picks appropariate action
   * @param {Array} perceptions Perception array with following elements: id, target, value and time
   */
  runGoalAgentProgram = perceptions => {
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

  /**
   * An agent program for utility-based agent
   * Utility-based agent program is filtering perceptions before moving to next phases
   * Utility-based agent program compares values of perception and rule and then picks appropariate action
   * only if it's optimal to do so
   * @param {Array} perceptions Perception array with following elements: id, target, value and time
   */
  runUtilityAgentProgram = perceptions => {
    this.ruleActionList.forEach(ruleAction => {
      let ruleSpecificPerceptions = perceptions.filter(e => e[0] + e[1] === ruleAction[0].toString() + ruleAction[1].toString().toLowerCase());
      let action;
      let lastPerception;
      if (ruleSpecificPerceptions.length > 1) lastPerception = ruleSpecificPerceptions[ruleSpecificPerceptions.length - 1];
      else if (ruleSpecificPerceptions.length > 0 && ruleSpecificPerceptions[ruleSpecificPerceptions.length - 1][2].toString() === ruleAction[2][1].toString()) {
        this.log(this.name + ' HAS REACHED ITS GOAL', null, true);
        this.state = 'ready';
        return;
      } else return;

      if (parseFloat(lastPerception[2]) < ruleAction[2][1]) {
        action = ruleAction[3][0];
      } else if (parseFloat(lastPerception[2]) > ruleAction[2][1]) {
        action = ruleAction[3][1];
      } else {
        this.log(this.name + ' HAS REACHED ITS GOAL', null, true);
        this.state = 'ready';
      }

      // If a new sensor value exceeds the rule's value it should wait for another perception
      if (Math.abs(ruleAction[2][1] - lastPerception[2]) < Math.abs(lastPerception[2] - ruleSpecificPerceptions[ruleSpecificPerceptions.length - 2][2])) {
        return;
      }
      if (!(Math.abs(ruleAction[2][1] - lastPerception[2]) < Math.abs(ruleAction[2][1] - ruleSpecificPerceptions[ruleSpecificPerceptions.length - 2][2]))) {
        return;
      }

      this.log('ACTION ' + action + ' HAS BEEN ACTIVATED', null, true);
    });
  };

  /**
   * Executes rule's operator on perception's value
   * @param {Array} perceptions perceptions [id, target, value, time]
   * @param {string} rule [operator, value]
   * @return {boolean} return true if value passes the rule otherwise false
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

  /**
   * Executes rule's operator on perception's value with reflex agent specific functionality
   * @param {Array} perceptions perceptions [id, target, value, time]
   * @param {string} rule [operator, value]
   * @returns {boolean} return true if value passes the rule otherwise false
   */
  executeOperationsForReflexAgent = (perceptions, rule) => {
    let value = perceptions[0][2];
    if (rule[0] === '<') return this.isSmaller(value, rule[1]);
    else if (rule[0] === '>') return this.isLarger(value, rule[1]);
    else if (rule[0] === '=') return this.isEqual(value, rule[1]);
    else return false;
  };

  /**
   * Executes rule's operator on perception's value with model-based reflex agent specific functionality
   * @param {Array} perceptions perceptions [id, target, value, time]
   * @param {string} rule [operator, value]
   * @returns {boolean} return true if value passes the rule otherwise false
   */
  executeOperationsForModelReflexAgent = (perceptions, rule) => {
    // Perceptions that match with the instruction rule
    let matchingPerceptions = [];

    // Adds the perceptions matching with the instruction rule to the matchingPerceptions array
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

  /**
   * The function parse rules in textual format and adds them to ruleActionList array
   * The rules are parsed in three different phases
   * Phase 1 - Validates general structure of rule is valid
   * Phase 2 - Validates agent specific rule structure
   * Phase 3 - Validates values occuring in rule
   * @param {Array} rules
   */
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

  /**
   * Creates logs for informing user about incorrect values of rule
   * @param {string} e invalid rule
   */
  reportInvalidAttributeValue(e) {
    this.log('Unable to register a rule - Invalid attribute value(s) - Invalid row : ' + e, 'Invalid attribute values');
    this.log('Check documentation for the syntax of ' + ['Reflex', 'Model-based reflex', 'Goal-based', 'Utility-based'][this.type] + ' agent rules', 'Invalid attribute values');
  }

  // Deletes agent
  delete() {
    this.appVMApi.deleteAgent(this.id);
  }

  /**
   * UTILITY FUNCTIONS
   */

  /**
   * Formats date to HH:MM format
   * @param {Date} date
   * @returns {string}
   */
  getFormattedTime = date => {
    if (!date) return false;
    let prefixMinutes = '0';
    let prefixHours = '0';
    if (date.getHours() > 9) prefixHours = '';
    if (date.getMinutes() > 9) prefixMinutes = '';
    return date.getDate() + '.' + (date.getMonth() + 1) + '.' + date.getFullYear() + ' ' + prefixHours + date.getHours() + ':' + prefixMinutes + date.getMinutes();
  };

  /**
   * Converts two string texts to numbers and checks if first value is smaller than the second value
   * @param {string} value
   * @param {string} compValue
   * @returns {boolean} true if first value is smaller than second value
   */
  isSmaller(value, compValue) {
    if (parseFloat(value) < parseFloat(compValue)) return true;
    else return false;
  }

  /**
   * Converts two string texts to numbers and checks if first value is larger than the second value
   * @param {string} value
   * @param {string} compValue
   * @returns {boolean} true if first value is larger than second value
   */
  isLarger(value, compValue) {
    if (parseFloat(value) > parseFloat(compValue)) return true;
    else return false;
  }

  /**
   * Converts two string texts to numbers and checks if first value is equal with the second value
   * @param {string} value
   * @param {string} compValue
   * @returns {boolean} true if first value is equal with second value
   */
  isEqual(value, compValue) {
    if (parseFloat(value) === parseFloat(compValue)) return true;
    else return false;
  }

  /**
   * Parses action value for four different agent programs
   * Reflex agents and model-based reflex agents have basic action structure
   * Goal-based and utility-based agents use : to separate direction-dependent actions with first action being
   * activated when perception's value is smaller than rule's value and the second action vice versa
   * Returns false if structure is invalid
   * @param {string} value action
   * @returns {string or Array} action or [first action, second action]
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
   * Parses rule
   * Reflex agent has a rule with following structure [<, >, =]number (ie. <22 or =14)
   * Model-based reflex agent has a rule with following structure [<, >, =]number:number (ie. <22:0 or =14:0)
   * Goal-based agents and utility-based agent have only number as value of RULE
   * Returns false if structure is invalid
   * @param {string} value rule
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
   * Parses target value
   * Returns false if it's empty
   * @param {string} value target
   * @returns {string} value or false
   */
  parseTargetValue = value => {
    if (value.length > 0) {
      return value;
    } else return false;
  };

  /**
   * Parses id value
   * Returns false if id is not type of number
   * @param {string} idValue id
   * @returns {number} value or false
   */
  parseIdValue = idValue => {
    if (typeof parseFloat(idValue) === 'number') {
      return parseFloat(idValue);
    } else return false;
  };

  /**
   * Validates general structure of rules
   * If rule has invalid structure it returns false
   * @param {Array} rules rules [id, idValue, target, targetValue, rule, ruleValue, action, actionValue]
   * @returns {boolean} answer true if rules are valid otherwise false
   */
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

  /**
   * Checks if value contains one of the elements of array
   * @param {string} value
   * @param {Array} arr array containing elements
   * @returns {boolean} true or false
   */
  containsElement = (value, arr) => {
    let answer = false;
    for (let i = 0; i < arr.length; i++) {
      if (value.includes(arr[i])) answer = true;
    }
    return answer;
  };

  /**
   * Creates a log
   * @param {string} message actual message to be printed
   * @param {string} errorMessage error message
   * @param {boolean} isAction flag for marking log as action
   */
  log = (message, errorMessage, isAction) => {
    if (errorMessage) this.appVMApi.log(message, this.id, { response: false, errorMessage: errorMessage, isAction: isAction });
    else this.appVMApi.log(message, this.id, { response: true, errorMessage: '', isAction: isAction });
  };

  /**
   * Creates a log for informing user that agent has not been initialized yet
   */
  agentIsNotInitialized = () => {
    this.log("Interrupting agent program execution as it hasn't been initialized yet", 'Interruption, agent is not initialized');
  };
}

/**
 * A class for log message
 */
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
    if (producer && (typeof producer.id === 'string' || typeof producer.id === 'number')) this.producer = producer;
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
