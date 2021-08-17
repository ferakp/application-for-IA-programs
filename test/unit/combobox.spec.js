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

  it("handles/reads the items attribute correctly", (done) => {
    parentViewModel.items = ["aa", "bb"];
    component
      .create(bootstrap)
      .then(() => {
        const cmb = document.querySelector("combobox");
        expect(
          cmb.querySelectorAll(".combobox__drop-down-list-item-content").length
        ).toBe(2);
        done();
      })
      .catch((e) => {
        fail(e);
        done();
      });
  });

  it("chooses correct item when user scroll items and press enter", (done) => {
    parentViewModel.items = ["aa", "bb"];
    component
      .create(bootstrap)
      .then(async () => {
        component.viewModel._focusedIndex = 0;
        await component.viewModel._inputElementEnterPressed();
        expect(component.viewModel.value).toEqual("aa");
        component.viewModel.value = "";
        await 1;
        component.viewModel._focusedIndex = 1;
        await component.viewModel._inputElementEnterPressed();
        expect(component.viewModel.value).toEqual("bb");
        done();
      })
      .catch((e) => {
        fail(e);
        done();
      });
  });

  it("controls drop down list appearence correctly when drop down list icon is clicked", (done) => {
    parentViewModel.items = ["aa", "bb"];
    component
      .create(bootstrap)
      .then(async () => {
        component.viewModel.dropDownListIconClicked();
        expect(component.viewModel.dropDownListOpened).toEqual(true);
        component.viewModel.dropDownListIconClicked();
        expect(component.viewModel.dropDownListOpened).toEqual(false);
        done();
      })
      .catch((e) => {
        fail(e);
        done();
      });
  });

  it("filters drop down list items correcly when the value is changed", (done) => {
    parentViewModel.items = ["aa", "bb"];
    component
      .create(bootstrap)
      .then(async () => {
        component.viewModel.value = "a";
        await 1;
        expect(component.viewModel._comboboxItems).toEqual(["aa"]);
        component.viewModel.value = "b";
        await 1;
        expect(component.viewModel._comboboxItems).toEqual(["bb"]);
        component.viewModel.value = "";
        await 1;
        expect(component.viewModel._comboboxItems).toEqual(["aa", "bb"]);
        done();
      })
      .catch((e) => {
        fail(e);
        done();
      });
  });

  it("filters drop down list items correctly when input element is clicked", (done) => {
    parentViewModel.items = ["aa", "bb", "cc"];
    component
      .create(bootstrap)
      .then(async () => {
        component.viewModel.value = "";
        component.viewModel.heavyMode = false;
        await 1;
        await component.viewModel._inputElementClicked();
        expect(component.viewModel._comboboxItems).toEqual(["aa", "bb", "cc"]);
        component.viewModel.dropDownListIconClicked();
        component.viewModel.value = "c";
        await 1;
        await component.viewModel._inputElementClicked();
        expect(component.viewModel._comboboxItems).toEqual(["cc"]);
        done();
      })
      .catch((e) => {
        fail(e);
        done();
      });
  });
});
