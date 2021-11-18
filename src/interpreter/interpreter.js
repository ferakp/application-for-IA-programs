import { inject } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';

/**
 * A class for console interpreter
 *
 * Instruction is entire paragraph with structure of command argument option optionValue
 *
 * SUPPORTED INSTRUCTIONS
 *
 * Upload [file|folder|text-file]
 * Create agent -file [index] -class [reflex|model-reflex|goal|utility]
 * Show files
 * Generate perception id [idValue] target [targetValue] value [value]
 * Run agent [agentID]
 *
 * See documentation for more details
 */

@inject(EventAggregator)
export class Interpreter {
  // Agent program types
  agentTypes = ['reflex', 'model-reflex', 'goal', 'utility'];

  supportedInstructions = {
    commands: ['upload', 'create', 'show', 'generate', 'run'],
    arguments: [['', 'file', 'files', 'folder', 'text-file'], ['agent'], ['files'], ['perception'], ['agent']],
    options: [[], ['class', 'file'], [], [], []],
  };

  // Map pointing commands to their functions
  commandFunctions;

  // Map pointing commands to their validators
  commandValidators;

  // Aurelia module for handling events
  eventAggregator;
  appVM;

  constructor(eventAggregator) {
    this.eventAggregator = eventAggregator;
    this.commandFunctions = new Map();
    this.commandValidators = new Map();

    // Upload instruction
    this.commandFunctions.set('upload', this.uploadFile);
    this.commandValidators.set('upload', this.isUploadInstructionValid);

    // Create instruction
    this.commandFunctions.set('create', this.create);
    this.commandValidators.set('create', this.isCreateInstructionValid);

    // Show instruction
    this.commandFunctions.set('show', () => this.eventAggregator.publish('openFilesView'));
    this.commandValidators.set('show', text => {
      return { response: text === 'show files', errorMessage: text === 'show files' ? '' : 'Invalid instruction' };
    });

    // Create instruction
    this.commandFunctions.set('generate', this.generate);
    this.commandValidators.set('generate', this.isGenerateInstructionValid);

    // Run instruction
    this.commandFunctions.set('run', params => {
      let agents = this.appVM.agents.filter(e => e.id.toString().startsWith(params[2]));
      if (agents.length === 1) agents[0].changeState('run');
    });
    this.commandValidators.set('run', this.isRunInstructionValid);
  }

  setAppVM(appVM) {
    this.appVM = appVM;
  }

  /**
   * Interprets instruction
   * Looks for validator, use it to validate input and then calls the command's function if input is valid instruction
   * @param {string} text instruction
   * @returns {Array} [isCommandValid, errorMessage, parameters]
   */
  interpret = text => {
    if (typeof text !== 'string') return [false, 'Invalid command'];
    let formattedCommand = text.toLowerCase();
    formattedCommand = formattedCommand.trim();
    if (this.supportedInstructions.commands.includes(this.readCommand(formattedCommand))) {
      let isInstructionValid = this.commandValidators.get(this.readCommand(formattedCommand))(formattedCommand);
      if (isInstructionValid.response) return [true, this.runFunction(this.commandFunctions.get(this.readCommand(formattedCommand)), isInstructionValid.parameters)];
      else return [false, isInstructionValid.errorMessage];
    } else {
      return [false, 'Invalid command'];
    }
  };

  /**
   * Utility functions for validating instructions
   * Validators return an object with two or three properties: response, errorMessage and parameters (optional)
   */

  isRunInstructionValid = text => {
    let fText = text.split(' ');
    if (fText.length === 3 && fText[0] === 'run' && fText[1] === 'agent' && fText[2].length > 0) {
      if (!isNaN(parseFloat(fText[2])) && this.appVM.agents.filter(e => e.id.toString().startsWith(fText[2])).length > 0) return { response: true, errorMessage: '', parameters: fText };
      else return { response: false, errorMessage: 'Invalid agent ID' };
    } else return { response: false, errorMessage: 'Invalid instruction structure' };
  };

  /**
   * Validates generate instruction
   * @param {string} text full trimmed instruction
   * @return {object} {response, errorMessage}
   */
  isGenerateInstructionValid = text => {
    let fText = text.split(' ');
    if (
      fText.length === 8 &&
      fText[0] === 'generate' &&
      fText[1] === 'perception' &&
      fText[2] === 'id' &&
      fText[3].length > 0 &&
      fText[4] === 'target' &&
      fText[5].length > 0 &&
      fText[6] === 'value' &&
      fText[7].length > 0
    ) {
      if (!isNaN(parseFloat(fText[7]))) return { response: true, errorMessage: '', parameters: fText };
      else return { response: false, errorMessage: 'Invalid instruction structure (invalid value)' };
    } else return { response: false, errorMessage: 'Invalid instruction structure' };
  };

  /**
   * Validates upload instruction
   * @param {string} text full trimmed instruction
   * @return {object} {response, errorMessage}
   */
  isUploadInstructionValid = text => {
    if (this.isInstructionStructureValid(text, true, true) && this.readCommand(text) === 'upload') {
      let args = this.readArguments(text);
      if (args.length === 0) return { response: true };
      else if (args.length > 1) return { response: false, errorMessage: "Invalid amount of arguments" };
      else if (args.length === 1 && this.supportedInstructions.arguments[this.supportedInstructions.commands.indexOf('upload')].includes(args[0])) return { response: true };
      else return { response: false, errorMessage: "Invalid argument" };
    } else {
      return { response: false, errorMessage: 'Invalid instruction structure' };
    }
  };

  /**
   * Validates create instruction
   * @param {string} text full trimmed instruction
   * @return {object} {response, errorMessage, parameters}
   */
  isCreateInstructionValid = text => {
    if (!this.isInstructionStructureValid(text, false, false) || this.readCommand(text) !== 'create') return { response: false, errorMessage: 'Invalid instruction structure' };
    let receivedArguments = this.readArguments(text);
    if (receivedArguments.length > 1) return { response: false, errorMessage: 'Create command supports only one argument' };
    let receivedOptions = this.readOptions(text);

    if (receivedArguments[0] === 'agent') {
      let classValue;
      let fileValue;
      receivedOptions.forEach(e => {
        if (e[0] === 'class') classValue = e[1];
        else if (e[0] === 'file') fileValue = e[1];
      });
      if (typeof parseInt(fileValue) === NaN || !(this.appVM && this.appVM.files.length > parseInt(fileValue))) return { response: false, errorMessage: 'Invalid file index' };
      if (this.agentTypes.includes(classValue)) {
        return { response: true, errorMessage: null, parameters: ['agent', this.agentTypes.indexOf(classValue), this.appVM.files[parseInt(fileValue)]] };
      } else return { response: false, errorMessage: 'Invalid agent type' };
    }

    return { response: false, errorMessage: 'Invalid argument "' + receivedArguments[0] + '"' };
  };

  /**
   * Structure validator for upload and create instructions
   * @param {string} text
   * @param {boolean} isArgumentsOptional
   * @param {boolean} isOptionsOptional
   * @returns {boolean} is correct
   */
  isInstructionStructureValid = (text, isArgumentsOptional, isOptionsOptional) => {
    if (this.hasValidCommand(text) && this.hasValidArguments(text, isArgumentsOptional) && this.hasValidOptions(text, isOptionsOptional)) {
      let options = this.readOptions(text);
      let args = this.readArguments(text);
      let lastWord = text.split(' ');
      lastWord = lastWord[lastWord.length - 1];
      if ((!isArgumentsOptional && args.length === 0) || (!isOptionsOptional && options.length === 0)) return false;
      if (options.length === 0 || options[options.length - 1][1] === lastWord || (options.length === 0 && (args.length === 0 || args[args.length - 1] === lastWord))) return true;
      else return false;
    } else {
      return false;
    }
  };

  /**
   * Validates command (program) of instruction 
   * @param {string} text full trimmed instruction
   * @returns {boolean} is correct
   */
  hasValidCommand = text => {
    if (this.supportedInstructions.commands.includes(this.readCommand(text))) return true;
    else return false;
  };

  /**
   * Validates arguments of instruction 
   * @param {string} text full trimmed instruction
   * @param {boolean} isArgumentsOptional are arguments optional
   * @returns {boolean} is correct
   */
  hasValidArguments = (text, isArgumentsOptional) => {
    let args = this.readArguments(text);
    if (isArgumentsOptional) return true;
    else if (!isArgumentsOptional && args.length > 0) return true;
    else return false;
  };

  /**
   * Validates options of instruction 
   * @param {string} text full trimmed instruction
   * @param {boolean} isOptionsOptional are options optional
   * @returns {boolean} correctness
   */
  hasValidOptions = (text, isOptionsOptional) => {
    let options = this.readOptions(text);
    let hasInvalidOption = false;
    for (let i = 0; i < options.length; i++) {
      if (options[i].length !== 2) hasInvalidOption = true;
    }
    if (hasInvalidOption) return false;
    else if (!isOptionsOptional && options.length > 0) return true;
    else if (isOptionsOptional) return true;

    return false;
  };

  /**
   * FUNCTIONS FOR EXECUTING COMMANDS
   */

  generate = params => {
    if (Array.isArray(params)) this.appVM.log('Following perception has been received ----> ' + params.join(' '), null, { response: true, errorMessage: '' });
    else return;
    this.appVM.perceptions.push(params.filter(e => !['id', 'generate', 'perception', 'target', 'value'].includes(e)));
  };

  create = params => {
    if (!Array.isArray(params)) return;
    if (params[0] === 'agent') {
      this.appVM.createAgent(params[1], params[2]);
    }
  };

  uploadFile = () => {
    this.eventAggregator.publish('activateUploadingComponent');
    this.eventAggregator.publish('openFilesView');
  };

  /**
   * UTILITY FUNCTIONS
   */

  /**
   * Returns command from the instruction
   * @param {string} text instruction
   * @returns {string}
   */
  readCommand(text) {
    return text.split(' ')[0];
  }

  /**
   * Returns arguments from the instruction
   * @param {string} text instruction
   * @returns {Array} arguments
   */
  readArguments(text) {
    let args = [];
    let splittedCommand = text.split(' ');
    if (splittedCommand.length < 2) return args;
    for (let i = 1; i < splittedCommand.length; i++) {
      if (!splittedCommand[i].includes('-')) args.push(splittedCommand[i]);
      else break;
    }
    return args;
  }

  /**
   * Returns options from the instruction
   * @param {string} text instruction
   * @returns {Array} options
   */
  readOptions(text) {
    let options = [];
    let splittedCommand = text.split(' ');
    for (let i = 1; i < splittedCommand.length; i++) {
      if (splittedCommand[i].charAt(0).includes('-')) {
        options.push([splittedCommand[i].replace('-', '')]);
      } else if (options.length > 0 && options[options.length - 1].length === 1) options[options.length - 1].push(splittedCommand[i]);
    }
    return options;
  }

  /**
   * Runs function with given parameters
   * @param {Function} fn
   * @param {Array} params
   * @returns
   */
  runFunction(fn, params) {
    try {
      fn(params);
      return '';
    } catch (err) {
      return err;
    }
  }
}
