import '@babel/polyfill';
import './components/cs-navbar';

class AuthorizeStep {
  run(navigationInstruction, next) {
    if (
      navigationInstruction
        .getAllInstructions()
        .some((i) => i.config.settings.roles.indexOf('admin') !== -1)
    ) {
      const isAdmin = /* insert magic here */ false;
      if (!isAdmin) {
        return next.cancel(new Redirect('koti'));
      }
    }
    return next();
  }
}


export class App {

  constructor(){

  }

  attached() {
    this.navBar.addMainFAIcon("fas fa-square-root-alt");
    this.navBar.addLink("Dashboard", "/dashboard");
  }

  configureRouter(config, router) {
    config.options.pushState = true;
    config.title = 'IA Simulation';
    config.addPipelineStep('authorize', AuthorizeStep);
    config.settings = {
      roles: ['admin', 'user'],
    };
    config.map([
      {
        route: ['', 'dashboard'],
        name: 'Dashboard',
        moduleId: PLATFORM.moduleName('./components/dashboard'),
        nav: true,
        title: 'Dashboard',
        settings: {
          roles: [],
        },
      },
      {
        route: 'instructions',
        name: 'Instructions',
        moduleId: PLATFORM.moduleName('./components/instructions'),
        nav: true,
        title: 'Instructions',
        settings: {
          roles: [],
        },
      },
    ]);
    this.router = router;
  }
  
}
