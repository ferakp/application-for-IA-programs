import { AppVM } from './app-vm';

export class ViewModelProvider {
  appVM;

  getAppVM = () => {
    if (!this.appVM) this.appVM = new AppVM();
    return this.appVM;
  };
}
