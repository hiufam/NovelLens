// import * as bootstrap from "bootstrap"; // if I add this js builds will disappear 

import { ContainerView } from '../modules/container-view';

import { DocViewer } from '../views/doc-viewer';
import { TranslatorViewer } from '../views/translator-viewer';
import { ImagesViewer } from '../views/images-viewer';
import { WikiViewer } from '../views/wiki-viewer';

import { signOut } from '../apis/auth';

export const classViewerMap = {
  'doc-viewer': {
    class: DocViewer
  },
  'translator-viewer': {
    class: TranslatorViewer
  },
  'images-viewer': {
    class: ImagesViewer
  },
  'wiki-viewer': {
    class: WikiViewer
  },
}

var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
  return new bootstrap.Tooltip(tooltipTriggerEl)
});

var toastList = document.getElementsByClassName('toast');
Array.from(toastList).forEach((toast) => {
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
    this.initializeView();
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
  