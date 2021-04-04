import {PLATFORM} from 'aurelia-pal';

export function configure(config) {
  config.globalResources(
    [
      PLATFORM.moduleName('../components/text-field'),
      PLATFORM.moduleName('../components/checkbox'),
    ]
  );
}
