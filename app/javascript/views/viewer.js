import { home } from 'views/home';

export class Viewer {
  constructor(container, node) {
    this.container = container;
    this.node = node;
    this.closeButton = container.querySelector('.close-button');    
  
    this.closeButton.addEventListener('click', this.#closeViewerEvent.bind(this));
  }

  #closeViewerEvent() {    
    home.tree.remove(this.node.key);
    home.containerView.formatView();
    home.saveView();
  }
}
