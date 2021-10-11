import { bootstrap } from "aurelia-bootstrapper";
import { StageComponent } from "aurelia-testing";

export function update() {
  return new Promise((r) => setTimeout(r));
}

export function expectElement(selector, propertyName) {
  if (selector) {
    return expect(document.querySelector(selector)[propertyName]);
  }
  return expect(document.querySelector(selector));
}

export function expectElementNumber(selector) {
  return expect(document.querySelectorAll(selector).length);
}

export function expectElementAttribute(selector, attributeName) {
  return expect(document.querySelector(selector).getAttribute(attributeName));
}

export function executeTest(resources, html, viewModel, done, test) {
  const component = StageComponent.withResources(resources);
  component
    .inView(html)
    .boundTo(viewModel)
    .create(bootstrap)
    .then(() => test(component))
    .then(done)
    .then(() => component.dispose())
    .catch((e) => {
      fail(e);
      done();
      component.dispose();
    });
}
