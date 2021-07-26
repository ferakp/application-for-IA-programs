import '@babel/polyfill';
import './components/cs-navbar';
export class App {

  constructor(){

  }

  attached() {
    this.navBar.addMainFAIcon("fas fa-square-root-alt");
    this.navBar.addLink("Home", "https://localhost/home.html");
  }
  
}
