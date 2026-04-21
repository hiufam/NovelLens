import { Viewer } from './viewer';

import { home } from './home';
import { profile } from './profile';

import { createNote } from '../apis/note'

const toastElement = document.getElementsByClassName('default-toast')[0];
const toast = bootstrap.Toast.getOrCreateInstance(toastElement);

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
    
    this.noteTitleModal = document.getElementById('note-title-modal');
    this.noteTitleModalInstance = bootstrap.Modal.getOrCreateInstance(this.noteTitleModal);
    this.noteTitleInput = this.noteTitleModal.querySelector('.note-title-text-input'); 
    this.noteTitleModalSave = this.noteTitleModal.querySelector('.save-button');   
    this.noteTitleForm = this.noteTitleModal.querySelector('#note-title-form');    

    this.textArea.addEventListener('input', this.#textAreaChangeEvent.bind(this));
    this.noteTitleForm.addEventListener('submit', this.#saveNoteEvent.bind(this));
  }
  
  logSubmit(event) {
    console.log(event);
    
    event.preventDefault();
  }

  loadSavedData(data) {
    this.textArea.value = data;
    this.#textAreaChangeEvent();
  }

  #textAreaChangeEvent() {    
    const value = this.textArea.value;    
    home.containerView.saveData(this.node.key, value);
  }

  async #saveNoteEvent(event) {
    event.preventDefault();
  
    const formData = new FormData(this.noteTitleForm);
    formData.append('content', this?.textArea.value || "");

    const result = await createNote(formData);

    if (result?.response) {
      this.noteTitleModalInstance.hide();
      this.noteTitleForm.reset();
    }

    if (result?.response.ok) {
      const toastBody = toastElement.querySelector('.toast-body');
      const toastTitle = toastElement.querySelector('.toast-title');
      
      toastBody.innerHTML = "Note saved!";
      toastTitle.innerHTML = 'Notice';
      toastTitle.classList.add('toast-notice');

      toast.show();

      profile.selectPageEvent(1);
    } else {
      const responseJSON = result?.data;
      const toastBody = toastElement.querySelector('.toast-body');
      const toastTitle = toastElement.querySelector('.toast-title');
      
      toastBody.innerHTML = responseJSON.error;
      toastTitle.innerHTML = 'Warning';
      toastTitle.classList.add('toast-alert');

      toast.show();
    }
  }
}
