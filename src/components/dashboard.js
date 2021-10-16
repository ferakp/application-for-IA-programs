import { bindable } from 'aurelia-framework';

export class Dashboard {

  @bindable
  expansionMode;

  /**
   * List of active view options: agent, log, files
   */
  activeView;


  expansionModeChanged(newValue) {
    
  }

}
