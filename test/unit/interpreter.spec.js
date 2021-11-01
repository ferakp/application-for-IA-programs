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

  it('validates the run instruction correctly', () => {
    appVM.createAgent(0, null);
    expect(interpreter.isRunInstructionValid('run agent '+appVM.agents[0].id).response).toBe(true);
    expect(interpreter.isRunInstructionValid('run agent').response).toBe(false);
  });

  it('validates the generate instruction correctly', () => {
    expect(interpreter.isGenerateInstructionValid('generate perception id').response).toBe(false);
    expect(interpreter.isGenerateInstructionValid('generate perception id 1 target tem value 3').response).toBe(true);
    expect(interpreter.isGenerateInstructionValid('generate perception id 1 target tem value a3').response).toBe(false);
  });

  it('validates the upload instruction correctly', () => {
    expect(interpreter.isUploadInstructionValid('upload').response).toBe(true);
    expect(interpreter.isUploadInstructionValid('upload fi').response).toBe(false);
    expect(interpreter.isUploadInstructionValid('upload file').response).toBe(true);
  });

  it('validates the create instruction correctly', () => {
    expect(interpreter.isCreateInstructionValid('create agent').response).toBe(false);
    appVM.files.push(null, "test.txt");
    expect(interpreter.isCreateInstructionValid('create agent -file 0 -class reflex').response).toBe(true);
    expect(interpreter.isCreateInstructionValid('create agent -file 0 -class reflex').parameters[0]).toBe('agent');
    expect(typeof interpreter.isCreateInstructionValid('create agent -file 0 -class reflex').parameters[1]).toBe('number');
    expect(interpreter.isCreateInstructionValid('create agent -file 0 -class reflex').parameters[2]).not.toEqual(undefined);
    expect(interpreter.isCreateInstructionValid('create agent -file 0 -class model-reflex').response).toBe(true);
    expect(interpreter.isCreateInstructionValid('create agent -file 0 -class goal').response).toBe(true);
    expect(interpreter.isCreateInstructionValid('create agent -file 0 -class utility').response).toBe(true);
  });

});
