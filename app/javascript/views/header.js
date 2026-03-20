import { viewerMap } from 'constants/views'

import { isOver, getHoveredSide } from 'helpers/elements'

import { addDndBehavior } from 'modules/dnd';
import { TreeNode } from 'modules/tree';

import { home } from 'views/home';

class Header {
  constructor() {
    this.init();
  }

  init() {
    this.saveViewButton = document.getElementById('save-view');
    this.toggleHeadersButton = document.getElementById('toggle-headers');
    this.viewersDropdown = document.getElementById('viewers-dropdown');
    this.viewersDropdownMenu = this.viewersDropdown.querySelector('.dropdown-menu');    
    
    // Iterate over viewrMap to craete dropdown item for view menu
    // <li><a class="dropdown-item" href="#">Action</a></li>
    Object.entries((viewerMap)).forEach(entry => {
      const viewer = entry[1];
      
      const listItem = document.createElement('li');
      const dropwDownItem = document.createElement('div');
      
      dropwDownItem.classList.add('viewer-dropdown-item', 'dropdown-item');
      dropwDownItem.append(viewer.name);
      
      // Add drag and drop behavior
      addDndBehavior(dropwDownItem, {
        onEnded: (_, event) => this.#dropItem(event, entry[0]),
      })
      
      listItem.append(dropwDownItem);
      
      this.viewersDropdownMenu.append(listItem);
    });

    this.toggleHeadersButton.addEventListener('click', this.#toggleHeaders.bind(this));
  }
  
  #dropItem(event, viewerId) {
    const areas = Array.from(document.getElementsByClassName('drag-box'));  
    const overedElement = isOver(areas, event);
    const position = getHoveredSide(overedElement, event);
    
    if (!position) return;
    
    // Add new node to tree
    const node = new TreeNode(crypto.randomUUID(), { viewerId: viewerId });
    const wrapperNode = new TreeNode(crypto.randomUUID(), { type: 'wrapper' });
    
    home.containerView.createContainer(wrapperNode);
    home.containerView.createContainer(node);
    
    wrapperNode.insert(node)
    home.tree.root.insert(wrapperNode);

    const overedElementNodeId = overedElement.id.split('-').at(-1);
    const overedNode = home.tree.findNode(overedElementNodeId);

    home.containerView.createDragArea(node);
    home.containerView.updateDDContainers(overedNode, node, position);
    home.containerView.formatView();

    const dragBox = node.data.element.querySelector('.drag-box');        

    const viewer = document.getElementById(node.data.viewerId); // Get viewer template
    const clonedViewer = viewer.cloneNode(true);

    dragBox.append(clonedViewer)

    node.data.viewer = Reflect.construct(viewerMap[node.data.viewerId].class, [dragBox, node]);
  }

  #toggleHeaders() {
    home.toggleHeaders = !home.toggleHeaders;

    const dragHeaders = document.getElementsByClassName('drag-header');
    Array.from(dragHeaders).forEach((header) => {
      header.hidden = !home.toggleHeaders;
    });
  }
}

export const header = new Header()
