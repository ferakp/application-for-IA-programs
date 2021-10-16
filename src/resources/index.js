import {PLATFORM} from 'aurelia-pal';

export function configure(config) {
  config.globalResources(
    [
      PLATFORM.moduleName('../components/text-field'),
      PLATFORM.moduleName('../components/checkbox'),
      PLATFORM.moduleName('../components/agent-view'),
      PLATFORM.moduleName('../components/combobox'),
      PLATFORM.moduleName('../components/combobox-tag'),
      PLATFORM.moduleName('../components/dashboard'),
      PLATFORM.moduleName('../components/dashboard-nav'),
      PLATFORM.moduleName('../components/dashboard-menu'),
      PLATFORM.moduleName('../components/console'),
      PLATFORM.moduleName('../components/terminal-line'),
    ]
  );
}
