// import * as bootstrap from "bootstrap"; // if I add this js builds will disappear 

import { ContainerView } from '../modules/container-view';

import { DocViewer } from '../views/doc-viewer';
import { TranslatorViewer } from '../views/translator-viewer';
import { ImagesViewer } from '../views/images-viewer';
import { WikiViewer } from '../views/wiki-viewer';

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

var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
  return new bootstrap.Tooltip(tooltipTriggerEl)
})

class Home {
  highlightedText;
  tree;
  containerView;
  
  toggleHeaders = true;
  
  constructor() {
    this.initializeView();
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
    })
  }
}
  
export const home = new Home()
  