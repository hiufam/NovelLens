// import * as bootstrap from "bootstrap"; // if I add this js builds will disappear 

import { ContainerView } from '../modules/container-view';

import { DocViewer } from '../views/doc-viewer';
import { DefinitionViewer } from '../views/definition-viewer';
import { ImagesViewer } from '../views/images-viewer';
import { WikiViewer } from '../views/wiki-viewer';
import { NoteViewer } from '../views/note-viewer';

import { signOut } from '../apis/auth';

export const classViewerMap = {
  'doc-viewer': {
    class: DocViewer
  },
  'definition-viewer': {
    class: DefinitionViewer
  },
  'images-viewer': {
    class: ImagesViewer
  },
  'wiki-viewer': {
    class: WikiViewer
  },
  'note-viewer': {
    class: NoteViewer
  }
}

const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
  return new bootstrap.Tooltip(tooltipTriggerEl)
});

const flashToast = document.getElementsByClassName('flash-toast');
Array.from(flashToast).forEach((toast) => {
  let bsAlert = new bootstrap.Toast(toast);
  setTimeout(function () {
    bsAlert.show();
  }, 100);
});

class Home {
  highlightedText;
  tree;
  containerView;
  
  toggleHeaders = true;
  
  constructor() {
    this.signOutButton = document.getElementsByClassName('sign-out-button')[0];
    this.signInButton = document.getElementsByClassName('sign-in-button')[0];    

    if (this.signOutButton) {
      this.signOutButton.addEventListener('click', this.#signOutEvent);
    }

    if (this.signInButton) {
      this.signInButton.addEventListener('click', this.#signInEvent);
    }
  }

  clearView() {
    this.containerView.clearView();
    this.tree = null;
    this.containerView = null;
  }

  initializeView() {
    this.tree = ContainerView.getSavedView();
    this.containerView = new ContainerView(this.tree);

    this.containerView.buildView({
      onDragEnded: this.containerView.saveView.bind(this.containerView),
      onResizingEnded: this.containerView.saveView.bind(this.containerView)
    });

    this.tree.breadthFirstTraverse((node) => {      
      if (node.data.viewerId) {
        const container = node.data.element.querySelector('.drag-box');        
        const viewer = document.getElementById(node.data.viewerId); // Get viewer template
        const clonedViewer = viewer.cloneNode(true);

        container.append(clonedViewer)
        
        node.data.viewer = Reflect.construct(classViewerMap[node.data.viewerId].class, [container, node]);        
      }
    });

    this.containerView.loadSavedData();
  }

  async #signOutEvent() {
    const result = await signOut();
    if (result) {
      window.location.href = "/session/new";
    }
  }

  #signInEvent() {
    window.location.href = "/session/new";
  }
}

export const home = new Home()
home.initializeView();
