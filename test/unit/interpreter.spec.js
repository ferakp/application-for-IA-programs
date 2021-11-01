import { Interpreter } from '../../src/interpreter/interpreter';
import { AppVM } from '../../src/view-models/app-vm';


describe('Test interpreter class', () => {

  /**
   * STANDARDS
   */

  const agentTypesString = ['reflex', 'model-reflex', 'goal', 'utility'];
  const commands = ['upload', 'create', 'show', 'generate', 'run'];
  const args = [['', 'file', 'folder', 'text-file'], ['agent'], ['files'], ['perception'], ['agent']];

  let interpreter;
  let appVM;

  beforeEach(() => {
    interpreter = new Interpreter();
    appVM = new AppVM();
    interpreter.setAppVM(appVM);
  });

  afterEach(() => {
    appVM.destroy();
  })

  /**
   * PROPERTIES
   */

  it('has registered necessary agent program types', () => {
    expect(interpreter.agentTypes.length).toBe(4);
    expect(interpreter.agentTypes).toEqual(expect.arrayContaining(agentTypesString));
  });

  it('has registered necessary commands', () => {
    expect(interpreter.supportedInstructions.commands.length).toBeGreaterThan(4);
    expect(interpreter.supportedInstructions.commands).toEqual(expect.arrayContaining(commands));
  });

  it('has registered necessary arguments', () => {
    expect(interpreter.supportedInstructions.arguments.length).toBeGreaterThan(4);
    commands.forEach(c => {
      expect(interpreter.supportedInstructions.arguments[interpreter.supportedInstructions.commands.indexOf(c)]).toEqual(expect.arrayContaining(args[commands.indexOf(c)]));
    })
  });

  /**
   * FUNCTIONS
   */

  it('has a valid command', () => {
    expect(interpreter.hasValidCommand('create agent -file 0 -class reflex')).toBe(true);
  });
});