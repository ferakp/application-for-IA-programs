import { bootstrap } from "aurelia-bootstrapper";
import { StageComponent } from "aurelia-testing";
import { PLATFORM } from "aurelia-pal";
import { Combobox } from "../../src/components/combobox.js";

describe("Stage App Component", () => {
  let component;
  let parentViewModel = {};

  beforeEach(() => {
    component = StageComponent.withResources(
      PLATFORM.moduleName("../../src/components/combobox")
    )
      .inView(
        '<combobox items.to-view="items" placeholder.to-view="placeholder" label.to-view="label" value.two-way="value" custom-filter.to-view="customFilter"></combobox>'
      )
      .boundTo(parentViewModel);
  });

  afterEach(() => component.dispose());

  it("renders component", (done) => {
    component
      .create(bootstrap)
      .then(() => {
        const cmb = document.querySelector("combobox");
        expect(cmb.children[0].className).toContain("combobox__container");
        done();
      })
      .catch((e) => {
        fail(e);
        done();
      });
  });


});
