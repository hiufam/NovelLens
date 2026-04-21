import { noteModal } from '../views/modals/note-modal';

import { deleteNote, getNotes } from '../apis/note';

class Profile {
  notesPage = 0;
  totalNotesPage = 0;

  constructor() {
    this.notesList = document.getElementsByClassName('notes-list')[0];
    this.notePagination = document.getElementById('notes-pagination').querySelector('.pagination'); 
    
    this.#renderNotes();
  }  

  selectPageEvent(page) {    
    this.notePagination.innerHTML = "";
    this.notesList.innerHTML = "";
    
    this.#renderNotes({ offset: page - 1 });
  }

  #saveNoteEvent(id, content) {
    noteModal.setData({ id, content });
  }

  async #deleteNoteEvent(id) {
    const result = await deleteNote(id);
    if (result?.data?.success) {
      this.selectPageEvent(this.notesPage || 0);
    }
  }

  async #renderNotes(params = { offset: 0 }) {
    const result = await getNotes({ limit: 8, offset: params.offset });
    const notes = result?.data?.records || [];
    
    if (!this.notesList || !notes) return;

    notes.forEach((note) => {
      const noteElement = document.createElement('div');
      noteElement.classList.add('note-item');

      const noteTitle = document.createElement('span');
      noteTitle.classList.add('note-title');
      noteTitle.textContent = note.title || '';

      const noteTools = document.createElement('div')
      noteTools.classList.add('note-tools');

      const editButton = document.createElement('button');
      editButton.classList.add('btn', 'btn-custom', 'btn-sm', 'edit-button')
      editButton.innerHTML = '<i class="bi bi-pencil-square"></i>';
      editButton.setAttribute('data-bs-toggle', 'modal');
      editButton.setAttribute('data-bs-target', '#note-title-modal');

      const deleteButton = document.createElement('button');
      deleteButton.classList.add('btn', 'btn-danger', 'btn-sm', 'delete-button')
      deleteButton.innerHTML = '<i class="bi bi-trash3-fill"></i>';
      
      noteTools.append(editButton);
      noteTools.append(deleteButton);

      deleteButton.addEventListener('click', (e) => {
        e.preventDefault();
        this.#deleteNoteEvent(note.id);
      });

      editButton.addEventListener('click', (e) => {
        e.preventDefault();
        this.#saveNoteEvent(note.id, note.content);
      });

      noteElement.append(noteTitle);
      noteElement.append(noteTools);

      this.notesList.append(noteElement);
    });

    // Update pagination
    const pagesCount = Math.ceil(result?.data?.total / result?.data?.limit);
    const currentPage = (result?.data?.offset || 0) + 1;

    for (let i = currentPage === pagesCount ? -2 : -1; i <= (currentPage === 1 ? 2 : 1); i++){
      if (currentPage + i <= 0 || currentPage + i > pagesCount) continue;
      const pageBtn = document.createElement('li');
      pageBtn.classList.add('page-item');
      pageBtn.innerHTML = `<a class="page-link ${i === 0 && "active"}" href="#">${currentPage + i}</a>`;
      pageBtn.addEventListener('click', (e) =>  {
        e.preventDefault();
        this.selectPageEvent(currentPage + i);
      });

      this.notePagination.append(pageBtn);
    }

    this.notesPage = currentPage;
    this.totalNotesPage = pagesCount;
  }
}

export const profile = new Profile;
