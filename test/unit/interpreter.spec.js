import { Interpreter } from '../../src/interpreter/interpreter';
import { AppVM } from '../../src/view-models/app-vm';
import { CustomFileReader } from '../../src/custom-file-reader/custom-file-reader';

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
    interpreter = new Interpreter(null);
    appVM = new AppVM();
    appVM.registerFileReader(new CustomFileReader());
    interpreter.setAppVM(appVM);
  });

  afterEach(() => {
    appVM.destroy();
  });

  /**
   * UTILITY FUNCTIONS
   */

  const createTextFile = (text, name) => {
    return new File([text], name + '.txt', { type: 'text/plain' });
  };

  const wait = t => {
    return new Promise(r => setTimeout(r, t));
  };

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
    });
  });

  /**
   * FUNCTIONS
   */

  it('has a valid command', () => {
    expect(interpreter.hasValidCommand('create agent -file 0 -class reflex')).toBe(true);
  });

  it('validates the run instruction correctly', () => {
    appVM.createAgent(0, null);
    expect(interpreter.isRunInstructionValid('run agent ' + appVM.agents[0].id).response).toBe(true);
    expect(interpreter.isRunInstructionValid('run agent').response).toBe(false);
  });

  it('validates the generate instruction correctly', () => {
    expect(interpreter.isGenerateInstructionValid('generate perception id').response).toBe(false);
    expect(interpreter.isGenerateInstructionValid('generate perception id 1 target tem value 3').response).toBe(true);
    expect(interpreter.isGenerateInstructionValid('generate perception id 1 target tem value a3').response).toBe(false);
  });

  it('validates the upload instruction correctly', done => {
    expect(interpreter.isUploadInstructionValid('upload').response).toBe(true);
    expect(interpreter.isUploadInstructionValid('upload fi').response).toBe(false);
    expect(interpreter.isUploadInstructionValid('upload file').response).toBe(true);
    done();
  });

  it('validates the create instruction correctly', () => {
    // Creates a test file
    appVM.files.push(createTextFile('ID 001 TARGET TEMP VALUE 22', 'test'));
    expect(appVM.files.length).toBe(1);

    expect(interpreter.isCreateInstructionValid('create agent').response).toBe(false);
    expect(interpreter.isCreateInstructionValid('create agent -file 0 -class reflex').response).toBe(true);
    expect(interpreter.isCreateInstructionValid('create agent -file 0 -class reflex').parameters[0]).toBe('agent');
    expect(typeof interpreter.isCreateInstructionValid('create agent -file 0 -class reflex').parameters[1]).toBe('number');
    expect(interpreter.isCreateInstructionValid('create agent -file 0 -class reflex').parameters[2]).not.toEqual(undefined);
    expect(interpreter.isCreateInstructionValid('create agent -file 0 -class model-reflex').response).toBe(true);
    expect(interpreter.isCreateInstructionValid('create agent -file 0 -class goal').response).toBe(true);
    expect(interpreter.isCreateInstructionValid('create agent -file 0 -class utility').response).toBe(true);

    // Deletes the test file
    appVM.files = [];
    expect(interpreter.isCreateInstructionValid('create agent -file 0 -class reflex').response).toBe(false);
  });

  /**
   * INTERPRETING
   */

  it('interprets the create instruction correctly', () => {
    // Create a test file
    appVM.files.push(createTextFile('ID 001 TARGET TEMP VALUE 22', 'test'));
    expect(appVM.files.length).toBe(1);

    expect(interpreter.interpret('create agent -fss reflex')[0]).toEqual(false);

    expect(interpreter.interpret('create agent -file 0 -class reflex')).toEqual(expect.arrayContaining([true, '']));
    expect(appVM.agents.length).toBe(1);
    expect(appVM.agents[0].type).toBe(0);

    expect(interpreter.interpret('create agent -file 0 -class model-reflex')).toEqual(expect.arrayContaining([true, '']));
    expect(appVM.agents.length).toBe(2);
    expect(appVM.agents[1].type).toBe(1);

    expect(interpreter.interpret('create agent -file 0 -class goal')).toEqual(expect.arrayContaining([true, '']));
    expect(appVM.agents.length).toBe(3);
    expect(appVM.agents[2].type).toBe(2);

    expect(interpreter.interpret('create agent -file 0 -class utility')).toEqual(expect.arrayContaining([true, '']));
    expect(appVM.agents.length).toBe(4);
    expect(appVM.agents[3].type).toBe(3);
  });

  it('interprets the generate instruction correctly', () => {
    expect(interpreter.interpret('generate perception')[0]).toEqual(false);
    expect(interpreter.interpret('generate perception id 01 target temp value 2')).toEqual(expect.arrayContaining([true, '']));
    expect(appVM.perceptions.length).toBe(1);
    expect(appVM.perceptions[0]).toEqual(expect.arrayContaining(['2', 'temp', '01']));
  });

  it('interprets the run instruction correctly', async () => {
    expect(interpreter.interpret('run agent')[0]).toEqual(false);
    appVM.files = [];
    appVM.files.push(createTextFile('ID 001 TARGET TEMP RULE <22 ACTION TESTACTION', 'test'));
    interpreter.interpret('create agent -file 0 -class reflex');
    expect(appVM.agents.length).toBe(1);
    await wait(1000);
    expect(interpreter.interpret('run agent ' + appVM.agents[0].id)).toEqual(expect.arrayContaining([true, '']));
    await wait(1000);
    expect(appVM.agents[0].state).toBe('running');
  });

  it('interprets the show instruction correctly', async () => {
    let requestReceived = false;
    interpreter.eventAggregator = {
      publish: () => {
        requestReceived = true;
      },
    };
    expect(interpreter.interpret('show')[0]).toEqual(false);
    expect(interpreter.interpret('show files')).toEqual(expect.arrayContaining([true, '']));
    await wait(1000);
    expect(requestReceived).toBe(true);
  });

  it('interprets the upload instruction correctly', async () => {
    let requestReceived = false;
    interpreter.eventAggregator = {
      publish: () => {
        requestReceived = true;
      },
    };
    expect(interpreter.interpret('upload')[0]).toEqual(true);
    await wait(100);
    expect(requestReceived).toBe(true);
    requestReceived = false;
    expect(interpreter.interpret('upload files')).toEqual(expect.arrayContaining([true, '']));
    await wait(100);
    expect(requestReceived).toBe(true);
  });
});
