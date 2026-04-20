import { Viewer } from './viewer';

import { home } from './home';

const toast = bootstrap.Toast.getOrCreateInstance(document.getElementsByClassName('default-toast')[0]);

export class NoteViewer extends Viewer {
  constructor(container, node) {
    super(container, node);    
    this.init(container);
  }  
  
  init() { 
    this.viewContainer = this.container.querySelector('.note-viewer'); 
    this.viewBodyContainer = this.container.querySelector('.note-viewer-body');
    this.saveButton = this.container.querySelector('.note-save-button');    
    this.loadButton = this.container.querySelector('.note-load-button');
    this.textArea = this.container.querySelector('.note-textarea');

    this.textArea.addEventListener('input', this.#textAreaChangeEvent.bind(this));
  }
  
  loadSavedData(data) {
    this.textArea.value = data;
    this.#textAreaChangeEvent();
  }

  #textAreaChangeEvent() {    
    const value = this.textArea.value;    
    home.containerView.saveData(this.node.key, value);
  }
}
