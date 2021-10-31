import { inject } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';

/**
 * This class represents an interpeter for console instructions.
 * A command is used to refer program, the first word of the instruction.
 */

@inject(EventAggregator)
export class Interpreter {
  // Agent types
  agentTypes = ['reflex', 'model-reflex', 'goal', 'utility'];

  supportedInstructions = {
    commands: ['upload', 'create', 'show', 'generate', 'run', 'delete'],
    arguments: [['', 'file', 'folder', 'text-file'], ['agent'], ['files'], ['perception'], ['agent'], ['agent']],
    options: [[], ['class', 'file'], [], [], [], []],
  };
  commandFunctions;
  commandValidators;

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
      if(agents.length === 1) agents[0].changeState("run");
    });
    this.commandValidators.set('run', this.isRunInstructionValid);
  }

  setAppVM(appVM) {
    this.appVM = appVM;
  }

  /**
   * Interprets instruction
   * @param {string} text executable instruction
   * @returns {Array} [isCommandValid, errorMessage]
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
   * Command validity validators
   *
   * Validators returns an object with three properties: response, errorMessage and parameters
   */

  isRunInstructionValid = text => {
    let fText = text.split(' ');
    if (fText.length === 3 && fText[0] === 'run' && fText[1] === 'agent' && fText[2].length > 0) {
      if (!isNaN(parseFloat(fText[2])) && this.appVM.agents.filter(e => e.id.toString().startsWith(fText[2])).length > 0) return { response: true, errorMessage: '', parameters: fText };
      else return { response: false, errorMessage: 'Invalid agent ID' };
    } else return { response: false, errorMessage: 'Invalid instruction structure' };
  };

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
    } else return { response: false, errorMessage: 'Invalid instruction structure' };
  };

  isUploadInstructionValid = text => {
    if (this.isInstructionStructureValid(text, true, true) && this.readCommand(text) === 'upload') {
      let args = this.readArguments(text);
      if (args.length === 0) return { response: true };
      else if (args.length > 1) return { response: false };
      else if (args.length === 1 && this.supportedInstructions.arguments[this.supportedInstructions.commands.indexOf('upload')].includes(args[0])) return { response: true };
      else return { response: false };
    } else {
      return { response: false, errorMessage: 'Invalid instruction structure' };
    }
  };

  /**
   *
   * @param {string} instruction
   * @returns {object} {response, errorMessage}
   */
  isCreateInstructionValid = text => {
    if (!this.isInstructionStructureValid(text, false, false) || this.readCommand(text) !== 'create') return { response: false, errorMessage: 'Invalid instruction structure' };
    let receivedArguments = this.readArguments(text);
    let supportedArguments = this.supportedInstructions.arguments[this.supportedInstructions.commands.indexOf('create')];
    if (receivedArguments.length > 1) return { response: false, errorMessage: 'Create command supports only one argument' };

    let receivedOptions = this.readOptions(text);
    let supportedOptions = this.supportedInstructions.options[this.supportedInstructions.commands.indexOf('create')];

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

  hasValidCommand = text => {
    if (this.supportedInstructions.commands.includes(this.readCommand(text))) return true;
    else return false;
  };

  hasValidArguments = (text, isArgumentsOptional) => {
    let args = this.readArguments(text);
    if (isArgumentsOptional) return true;
    else if (!isArgumentsOptional && args.length > 0) return true;
    else return false;
  };

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
   * Command functions
   */

  generate = params => {
    if (Array.isArray(params)) this.appVM.log('Following perception has been received ----> ' + params.join(' '), null, { response: true, errorMessage: '' });
    else return;
    this.appVM.perceptions.push(params.filter(e => !['id', 'generate', 'perception', 'target', 'value'].includes(e)));
  };

  /**
   *
   * @param {Array} parameters [argument, agentType, file]}
   */
  create = arr => {
    if (!Array.isArray(arr)) return;
    if (arr[0] === 'agent') {
      this.appVM.createAgent(arr[1], arr[2]);
    }
  };

  uploadFile = () => {
    this.eventAggregator.publish('activateUploadingComponent');
    this.eventAggregator.publish('openFilesView');
  };

  /**
   * Utility functions
   */

  readCommand(text) {
    return text.split(' ')[0];
  }

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

  runFunction(fn, params) {
    try {
      fn(params);
    } catch (err) {
      return err;
    }
  }
}
