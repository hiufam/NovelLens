import { Viewer } from './viewer';

import { home } from './home';
import { profile } from './profile';
import { noteModal } from './modals/note-modal';

import { createNote } from '../apis/note'

const toastElement = document.getElementsByClassName('default-toast')[0];
const toast = bootstrap.Toast.getOrCreateInstance(toastElement);

export class NoteViewer extends Viewer {
  note = undefined;

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
    this.saveButton.addEventListener('click', this.#updateNoteModalNoteContentEvent.bind(this));
    this.loadButton.addEventListener('click', this.#loadNoteEvent.bind(this));
  }

  loadSavedData(data) {
    this.textArea.value = data;
  }

  loadNote(note) {
    if (!note) return;

    this.note = note;
    this.textArea.value = note.content;

    home.containerView.saveData(this.node.key, note.content);
  }
  
  #textAreaChangeEvent() {    
    const value = this.textArea.value;    
    home.containerView.saveData(this.node.key, value);
  }

  #updateNoteModalNoteContentEvent() {
    noteModal.setData({
      content: this.textArea.value
    });
  }

  #loadNoteEvent() {
    profile.selectNoteEvent(this);
  }
}
