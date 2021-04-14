import '@babel/polyfill';

export class App {
  message = 'Hello World!';
  items = [];
  itemsComboboxTag = [];

  constructor(){
    for(let i = 0; i<150; i++) {
      this.items.push("Sample item " + i);
      this.itemsComboboxTag.push("Sample item " + i);
    }
  }
  
}
