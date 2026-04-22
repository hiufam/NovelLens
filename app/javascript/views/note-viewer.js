import { Viewer } from './viewer';

import { home } from './home';
import { profile } from './profile';
import { noteModal } from './modals/note-modal';

import { createNote, updateNote } from '../apis/note'

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
    this.createButton = this.container.querySelector('.note-create-button');    
    this.saveButton = this.container.querySelector('.note-save-button');    
    this.loadButton = this.container.querySelector('.note-load-button');
    this.textArea = this.container.querySelector('.note-textarea');
    this.noteTitle = this.container.querySelector('.note-title');
    
    this.noteTitleModal = document.getElementById('note-title-modal');
    this.noteTitleModalInstance = bootstrap.Modal.getOrCreateInstance(this.noteTitleModal);
    this.noteTitleInput = this.noteTitleModal.querySelector('.note-title-text-input'); 
    this.noteTitleModalSave = this.noteTitleModal.querySelector('.save-button');   
    this.noteTitleForm = this.noteTitleModal.querySelector('#note-title-form');    

    this.textArea.addEventListener('input', this.#textAreaChangeEvent.bind(this));
    this.createButton.addEventListener('click', this.#updateNoteModalNoteContentEvent.bind(this));
    this.loadButton.addEventListener('click', this.#loadNoteEvent.bind(this));
    this.saveButton.addEventListener('click', this.#saveNoteEvent.bind(this));
  }

  loadSavedData(data) {
    this.textArea.value = data;
  }

  loadNote(note) {
    if (!note) return;

    this.note = note;
    this.textArea.value = note.content;
    this.noteTitle.innerHTML = `Note: ${note.title}`;
    this.saveButton.hidden = false;

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

  async #saveNoteEvent() {
    if (!this.note) return;

    const formData = new FormData();
    formData.append('content', this.textArea.value || "");

    const result = await updateNote(this.note.id, formData);

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
