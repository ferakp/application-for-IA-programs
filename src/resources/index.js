import {PLATFORM} from 'aurelia-pal';

export function configure(config) {
  config.globalResources(
    [
      PLATFORM.moduleName('../components/text-field'),
      PLATFORM.moduleName('../components/checkbox'),
      PLATFORM.moduleName('../components/combobox'),
      PLATFORM.moduleName('../components/combobox-tag'),
      PLATFORM.moduleName('../components/control-panel'),
    ]
  );
}
