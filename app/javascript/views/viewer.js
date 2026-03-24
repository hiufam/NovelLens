import { home } from '../views/home';

export class Viewer {
  moveEnabled = false;
  dragArea;

  constructor(container, node) {
    this.container = container;
    this.node = node;
    
    this.moveEnabled = node?.data?.moveEnabled
    
    this.closeButton = container.querySelector('.close-button');    
    this.moveButton = container.querySelector('.move-button');    
    this.dragArea = this.container.querySelector('.drag-area');
    this.dragHeader = this.container.querySelector('.drag-header');

    this.closeButton?.addEventListener('click', this.#closeViewerEvent.bind(this));
    this.moveButton?.addEventListener('click', this.#toggleMoveEvent.bind(this));
    
    const gripIcon = document.createElement('i');
    gripIcon.classList.add('bi', 'bi-grip-vertical');
    gripIcon.hidden = !this.moveEnabled;
    
    this.gripIcon = gripIcon;
    this.dragHeader.insertBefore(gripIcon, this.dragArea);

    if (this.moveEnabled) {
      this.dragHeader.style['cursor'] = this.moveEnabled ? 'move' : 'auto';
    }
  }

  #closeViewerEvent() {    
    home.tree.remove(this.node.key);
    home.containerView.formatView();
    home.containerView.saveView();
  }

  #toggleMoveEvent() {
    this.moveEnabled = !this.moveEnabled;
    this.gripIcon.hidden = !this.moveEnabled;
    this.dragHeader.style['cursor'] = this.moveEnabled ? 'move' : 'auto';
    this.node.data.moveEnabled = this.moveEnabled;

    home.containerView.saveView();
  }
}
