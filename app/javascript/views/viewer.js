import { viewerMap } from '../constants/views';
import { home, classViewerMap } from '../views/home';

// BUG: upload file, create viewer, resize doc, resizer viewer, delete created viewer
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
    this.gripIcon = this.container.querySelector('.bi-grip-vertical');
    this.loading = this.container.querySelector('.viewer-spinner');
    
    this.closeButton?.addEventListener('click', this.#closeViewerEvent.bind(this));
    this.moveButton?.addEventListener('click', this.#toggleMoveEvent.bind(this));

    this.gripIcon.hidden = !this.moveEnabled;
    
    if (this.moveEnabled) {
      this.dragHeader.style['cursor'] = this.moveEnabled ? 'move' : 'auto';
    }

    this.changeViewDropdown = this.container.querySelector('.change-view-dropdown');
    this.changeViewMenu = this.changeViewDropdown.querySelector('.dropdown-menu');
    this.changeViewDropdownInstance = bootstrap.Dropdown.getOrCreateInstance(this.changeViewDropdown);

    Object.entries((viewerMap)).forEach(entry => {
      const viewer = entry[1];
      
      const listItem = document.createElement('li');
      const dropwDownItem = document.createElement('div');
      
      dropwDownItem.classList.add('viewer-dropdown-item', 'dropdown-item');
      dropwDownItem.append(viewer.name);
      dropwDownItem.addEventListener('click', (e) => {
        e.preventDefault();        
        this.#changeViewEvent(entry[0]);
      });

      listItem.append(dropwDownItem);
      
      this.changeViewMenu.append(listItem);
    });
  }

  setLoading(bool) {
    this.loading.hidden = !bool    
  }

  loadSavedData(data) {
    console.log(data);
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

  #changeViewEvent(viewerId) {    
    const container = this.node.data.element.querySelector('.drag-box');        
    const previousViewer = container.querySelector('.viewer');

    const viewer = document.getElementById(viewerId);
    const clonedViewer = viewer.cloneNode(true);
    
    container.append(clonedViewer);
    
    previousViewer.remove();
    this.changeViewMenu.innerHTML = '';

    this.node.data.viewerId = viewerId;
    this.node.data.viewer = Reflect.construct(classViewerMap[viewerId].class, [container, this.node]);
    
    const dragTitle = this.container.querySelector('.drag-title');
    dragTitle.textContent = viewerMap[viewerId].name;

    home.containerView.saveView();
  }
}
