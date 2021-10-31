import { update, executeTest, expectElement, expectElementAttribute, expectElementNumber, expectViewModelProperty } from '../test-utils';
import { Container } from 'aurelia-dependency-injection';
import { Interpreter } from '../../src/interpreter/interpreter';

describe('Test Interpreter class', () => {
  const container = new Container();
  const instance = container.get(Interpreter);

  beforeEach(() => {
    container = new Container();
    instance = container.get(Interpreter);
  });

  it('has correct agent types', () => {
    expect(instance.agentTypes).toBe(4);
  });
});
