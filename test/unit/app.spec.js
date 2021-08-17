import {bootstrap} from 'aurelia-bootstrapper';
import {StageComponent} from 'aurelia-testing';
import {PLATFORM} from 'aurelia-pal';

describe('Stage App Component', () => {
  let component;

  beforeEach(() => {
    component = StageComponent
      .withResources(PLATFORM.moduleName('../../src/app'))
      .inView('<app></app>');
  });

  afterEach(() => component.dispose());

  it('should exist', done => {
    component.create(bootstrap).then(() => {
      const app = document.querySelector("app");
      expect(app.children.length).toBe(1);
      done();
    }).catch(e => {
      fail(e);
      done();
    });
  });
});
