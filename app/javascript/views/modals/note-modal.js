import { profile } from '../profile';

import { createNote, updateNote } from '../../apis/note'

const toastElement = document.getElementsByClassName('default-toast')[0];
const toast = bootstrap.Toast.getOrCreateInstance(toastElement);

class NoteModal {
  data = {
    id: undefined,
    content: undefined,
  }

  constructor() {
    this.noteTitleModal = document.getElementById('note-title-modal');
    this.noteTitleModalInstance = bootstrap.Modal.getOrCreateInstance(this.noteTitleModal);
    this.noteTitleInput = this.noteTitleModal.querySelector('.note-title-text-input'); 
    this.noteTitleModalSave = this.noteTitleModal.querySelector('.save-button');   
    this.noteTitleForm = this.noteTitleModal.querySelector('#note-title-form');
  
    this.noteTitleForm.addEventListener('submit', this.#saveNoteEvent.bind(this));
    this.noteTitleModal.addEventListener('hidden.bs.modal', this.clearData());
  }

  clearData() {
    this.id = undefined;    
    this.text = undefined;
  }

  setData(data) {
    this.data = data;
  }
  
  async #saveNoteEvent(event) {
    event.preventDefault();
  
    const formData = new FormData(this.noteTitleForm);
    formData.append('content', this.data.content || "");

    let result;
    if (this.data.id) {      
      result = await updateNote(this.data.id, formData);
    } else {
      result = await createNote(formData);
    }


    if (!result) return;

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

export const noteModal = new NoteModal;
