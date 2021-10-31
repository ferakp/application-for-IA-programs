import { update, executeTest, expectElement, expectElementAttribute, expectElementNumber, expectViewModelProperty } from '../test-utils';
import { Interpreter } from '../../src/interpreter/interpreter';

describe('Test Interpreter class', () => {
  let interpreter;

  beforeEach(() => {
    interpreter = new Interpreter();
  });

  it('has correct agent types', () => {
    expect(interpreter.agentTypes).toBe(4);
  });
});
