import { AppVM } from './app-vm';

/**
 * Class for providing AppVM instance
 */
export class ViewModelProvider {
  appVM;

  /**
   * Returns appVM if it exists otherwise creates a new one and return
   * recently created instance
   * @returns {AppVM}
   */
  getAppVM = () => {
    if (!this.appVM) this.appVM = new AppVM();
    return this.appVM;
  };
}
