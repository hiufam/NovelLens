import { home } from 'views/home'

class Header {
  constructor() {
    this.init();
  }

  init() {
    this.saveViewButton = document.getElementById('save-view');
    this.toggleDragAndDrog = document.getElementById('toggle-dnd');
  }
}

export const header = new Header()
