import { bindable, inject } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';

@inject(EventAggregator)
export class Interpreter {
  supportedInstructions = {
    commands: ['upload'],
    arguments: [['', 'file', 'folder', 'text-file', 'perceptions']],
    flags: [[]],
  };
  commandFunctions;
  commandValidators;

  eventAggregator;

  constructor(eventAggregator) {
    this.eventAggregator = eventAggregator;
    this.commandFunctions = new Map();
    this.commandValidators = new Map();
    this.commandFunctions.set('upload', this.uploadFile);
    this.commandValidators.set('upload', this.isUploadCommandCorrect);
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
      if (this.commandValidators.get(this.readCommand(formattedCommand))(formattedCommand)) this.runFunction(this.commandFunctions.get(this.readCommand(formattedCommand)), formattedCommand);
      else return [false, 'Invalid arguments'];
      return [true];
    } else {
      return [false, 'Invalid command'];
    }
  };

  /**
   * Command validity validators
   */

  isUploadCommandCorrect = command => {
    if (this.readCommand(command) === 'upload') {
      let args = this.readArguments(command);
      console.log(args);
      if (args.length === 0) return true;
      else if (args.length === 1 && this.supportedInstructions.args[this.supportedInstructions.commands.indexOf('upload')].includes(args[1])) return true;
      else return false;
    }
  };

  /**
   * Command functions
   */

  uploadFile = () => {
    this.eventAggregator.publish('activateUploadingComponent');
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
    }
    return args;
  }

  runFunction(fn, params) {
    try {
      fn(params);
    } catch (err) {
      console.log(err);
    }
  }
}
