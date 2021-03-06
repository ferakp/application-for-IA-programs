import { bootstrap } from 'aurelia-bootstrapper';
import { StageComponent } from 'aurelia-testing';

export function update(time) {
  time = time || 0;
  return new Promise(r => setTimeout(r, time));
}

export function expectElement(selector, propertyName) {
  if (propertyName) {
    return expect(document.querySelector(selector)[propertyName]);
  }
  return expect(document.querySelector(selector));
}

export function expectElementNumber(selector) {
  return expect(document.querySelectorAll(selector).length);
}

export function expectViewModelProperty(component, propertyName) {
  return expect(component.viewModel[propertyName]);
}

export function expectElementAttribute(selector, attributeName) {
  return expect(document.querySelector(selector).getAttribute(attributeName));
}

export function createFile(text, name, type) {
  if (!type) type = 'txt';
  return new File([text], name + '.' + type, { type: 'text/plain' });
};

export function executeTest(resources, html, viewModel, done, testC) {
  const component = StageComponent.withResources(resources);
  component
    .inView(html)
    .boundTo(viewModel)
    .create(bootstrap)
    .then(() => testC(component))
    .then(done)
    .then(() => component.dispose())
    .catch(err => {
      endTest(done, err, component);
    });
}

function endTest(done, err, component) {
  if (err) fail(err);
  done();
  if (component) component.dispose();
}
