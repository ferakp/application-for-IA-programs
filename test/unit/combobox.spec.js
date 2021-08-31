import { bootstrap } from "aurelia-bootstrapper";
import { StageComponent } from "aurelia-testing";
import { PLATFORM } from "aurelia-pal";

describe("Stage App Component", () => {
  let component;
  let parentViewModel = {};

  beforeEach(() => {
    component = StageComponent.withResources(
      PLATFORM.moduleName("../../src/components/combobox")
    )
      .inView(
        '<combobox items.to-view="items" placeholder.to-view="placeholder" label.to-view="label" value.two-way="value" custom-filter.to-view="customFilter" data-provider.to-view="dataProvider"></combobox>'
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
        expect(cmb.querySelector("text-field").querySelectorAll(".text-field__input-element").length).toBe(1);
        done();
      })
      .catch((e) => {
        fail(e);
        done();
      });
  });

  it("prints items correctly in drop down list container (item attribute)", (done) => {
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

  it("filters drop down list items correctly with a custom filter", (done) => {
    parentViewModel.items = ["aa", "bb", "cc"];
    parentViewModel.customFilter = (value, items) => {
      if (!Array.isArray(items)) return [];
      else if (!value) return items;
      else {
        return items.filter((e) => e === value);
      }
    };
    component
      .create(bootstrap)
      .then(async () => {
        component.viewModel.value = "";
        await component.viewModel._inputElementClicked();
        expect(component.viewModel._comboboxItems).toEqual(["aa", "bb", "cc"]);
        component.viewModel.dropDownListIconClicked();
        component.viewModel.value = "c";
        await component.viewModel._inputElementClicked();
        expect(component.viewModel._comboboxItems).toEqual([]);
        component.viewModel.dropDownListIconClicked();
        component.viewModel.value = "cc";
        await component.viewModel._inputElementClicked();
        expect(component.viewModel._comboboxItems).toEqual(["cc"]);
        done();
      })
      .catch((e) => {
        fail(e);
        done();
      });
  });

  it("filters drop down list items correctly with a custom data provider", (done) => {
    parentViewModel.items = null;
    parentViewModel.dataProvider = async (value) => {
      const items = ["abc", "dfeg", "jhsh"];
      if (!value) return items;
      else {
        return items.filter((e) => e.includes(value));
      }
    };
    component
      .create(bootstrap)
      .then(async () => {
        component.viewModel.value = "";
        await component.viewModel._inputElementClicked();
        await 1;
        expect(component.viewModel._comboboxItems).toEqual([
          "abc",
          "dfeg",
          "jhsh",
        ]);
        component.viewModel.dropDownListIconClicked();
        component.viewModel.value = "c";
        await component.viewModel._inputElementClicked();
        await 1;
        expect(component.viewModel._comboboxItems).toEqual(["abc"]);
        component.viewModel.dropDownListIconClicked();
        component.viewModel.value = "jh";
        await component.viewModel._inputElementClicked();
        await 1;
        expect(component.viewModel._comboboxItems).toEqual(["jhsh"]);
        done();
      })
      .catch((e) => {
        fail(e);
        done();
      });
  });
});
