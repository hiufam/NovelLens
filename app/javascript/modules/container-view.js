import { addResizingBehavior } from '../modules/resizer';
import { addDragBoxBehavior } from '../modules/dragbox';

import { TreeNode, Tree } from '../modules/tree';

import { resizerSize } from '../constants/views';
import { viewerMap } from '../constants/views';

import { v4 as uuidv4 } from 'uuid';

export class ContainerView {
  tree
  resizers = [];
  containers = [];
  options

  /**
   * 
   * @param {*} tree 
   * @param {{
   *  onDragEnded: () => void,
   *  onResizingEnded: () => void,
   * }} options 
   */
  constructor(tree, options = {}) {
    this.tree = tree
    this.options = options;

    this.rootContainer = this.createContainer(tree.root);
    this.rootContainer.style.height = '100%';
    
    this.mainContainer = document.getElementById('main-container');
    this.mainContainer.append(this.rootContainer);

    tree.root.data.element = this.rootContainer;
    
    this.dragbox = document.getElementById('shared-dragbox');
  }

  // parentNode must have element data
  getDefaultChildContainerSizePercentage(parentNode) {
    let sizeKey = 'width';
    const containerElement = parentNode.data.element;
    if (parentNode.data.flexDirection == 'column') {
      sizeKey = 'height'
    }
    
    const clientRect = containerElement.getBoundingClientRect();
    const size = clientRect[sizeKey];
    const remainingSize = size - (parentNode.children.length - 1) * resizerSize;

    return {
      sizeKey,
      sizePercentage: (remainingSize / parentNode.children.length) / size * 100 + '%',
    }
  }
  
  // <div id="areas-container-1" class="areas-container horizontal-container"  style="width: 20%;">
  //   <div id="area-1" class="area">
  //     <div class="drag-header">
  //       Click here to move
  //     </div>
  //   </div>
  // </div>
  createContainer(node) {
    const container = document.createElement('div');
    
    container.id = `areas-container-${node.key}`;
    container.classList.add('areas-container');
    
    if (node.data.flexDirection === 'row') {
      container.classList.add('horizontal-container');
    }
    if (node.data.flexDirection === 'column') {
      container.classList.add('vertical-container');
    }
    if (node.data.type === 'wrapper') {
      container.classList.add('container-wrapper');
    }

    // get element for node
    node.data.element = container;

    
    return container;
  }
  
  // <div id="resizer-0" class="resizer horizontal-resizer">
  // </div>
  createResizer(siblingNode, parentNode) {
    const resizer = document.createElement('div');
    
    const nodeIndex = siblingNode.getRelativeIndex();
    
    resizer.id = `resizer-${parentNode.key}-${nodeIndex}`;
    resizer.classList.add('resizer');
    
    if (parentNode.data.flexDirection === 'row') {
      resizer.classList.add('vertical-resizer');
    }
    
    if (parentNode.data.flexDirection === 'column') {
      resizer.classList.add('horizontal-resizer');
    }
    
    return resizer;
  }

  /**
   * Node must have existing container
   * @param {*} node 
   */
  createDragArea(node) {
    const dragContainerElement = node.data.element; 
    
    const clonedDragbox = this.dragbox.cloneNode(true);
    clonedDragbox.id = `shared-dragbox-${node.key}`;

    const dragArea = document.createElement('div');
    dragArea.className = 'drag-area';

    const dragTitle = document.createElement('span');

    const title = clonedDragbox.getElementsByTagName('span')[0];
    dragTitle.textContent = `${viewerMap[node.data.viewerId]?.name}`;
    
    dragArea.append(dragTitle);
    
    title.replaceWith(dragArea);

    dragContainerElement.append(clonedDragbox);    

    addDragBoxBehavior(node, clonedDragbox, this, {
      onEnded: this.options?.onDragEnded,
    });
  }
  
  buildContainers() {
    this.tree.breadthFirstTraverse((node, parentNode) => {
      if (node.key === 'root') return; 

      const dragContainerElement = this.createContainer(node);
      
      this.containers.push(dragContainerElement);
      
      if (node.data.type !== 'wrapper') {
        this.createDragArea(node);
      }
  
      if (parentNode) {        
        const parentElement = document.getElementById(`areas-container-${parentNode.key}`)    
        parentElement.append(dragContainerElement);
      }
  
      if (parentNode?.children?.length > 0) {      
        const data = this.getDefaultChildContainerSizePercentage(parentNode);
        const sizePercentage = node?.data?.size ? `${parseFloat(node?.data?.size)}%` : data.sizePercentage

        dragContainerElement.style[data.sizeKey] = sizePercentage;
        // get size percentage for node
        
        node.data.size = sizePercentage;
      }
    });
  }
  
  
  buildResizers() {
    this.tree.breadthFirstTraverse((node, parentNode, isLastNode) => {
      if (node.key === 'root') return; 
      
      if (!isLastNode) {
        const resizer = this.createResizer(node, parentNode);
        node.data.element.after(resizer);
        this.resizers.push(resizer);
      }
    });

    const resizers = document.getElementsByClassName('resizer');    
    addResizingBehavior(resizers, this.tree, {
      onEnded: this.options?.onResizingEnded,
    });
  }
  
  clearResizers() {
    this.resizers.forEach((res) => {
      res.remove();
    })
    this.resizers = [];
  }

  rebuildContainers() {
    const newContainers = [];
    this.tree.breadthFirstTraverse((node, _) => {
      if (node.key === 'root') return;

      const parentNodeElement = node.data.parent.data.element;
      
      parentNodeElement.append(node.data.element);

      newContainers.push(node.data.element);
    });    
    const newContainersIds = newContainers.map((c) => c.id);    

    this.containers.forEach((container) => {
      if (!newContainersIds.includes(container.id)) {
        container.remove();
      }      
    });

    this.containers = newContainers;
  }

  updateContainers(parentNode) {
    if (parentNode?.children?.length > 0) {
      const data = this.getDefaultChildContainerSizePercentage(parentNode);      
      
      parentNode?.children.forEach((child) => {
        const element = child.data.element;
        const sizePercentage = child?.data?.size ? `${parseFloat(child?.data?.size)}%` : data.sizePercentage
        
        element.style[data.sizeKey] = sizePercentage;

        child.data.size = sizePercentage;
      })
    }
  }

  /**
   * Updating drag and drop containers
   * @param {*} overedNode 
   * @param {*} draggingNode 
   * @param {*} position 
   * @returns 
   */
  updateDDContainers(overedNode, draggingNode, position) {    
    if (overedNode.key === draggingNode.key || !position) return;

    let isParallelWithParent = false;

    if ((position === 'right' || position === 'left') && overedNode.data.parent.data.flexDirection === 'row') {
      isParallelWithParent = true;
    }

    if ((position === 'top' || position === 'bottom') && overedNode.data.parent.data.flexDirection === 'column') {
      isParallelWithParent = true;
    }

    if (isParallelWithParent) {
      this.parallelSizeUpdate(draggingNode, overedNode, position);
    } else {
      this.perpendicularSizeUpdate(draggingNode, overedNode, position); 
    }
  }

  rebuildResizers() {
    this.clearResizers();
    this.buildResizers();
  }

  checkParallel(nodeA, nodeB) {
    let nodeADirection = 'row';
    let nodeBDirection = 'row';
    
    nodeADirection = nodeA?.data?.flexDirection ?? nodeADirection;
    nodeBDirection = nodeB?.data?.flexDirection ?? nodeBDirection;

    return nodeADirection === nodeBDirection;
  }

  getView() {
    const nodeKeys = new Map();

    this.tree.breadthFirstTraverse((node) => {
      const savedNode = {};

      savedNode.key = node.key;
      savedNode.children = [];
      savedNode.data = {...node.data};

      // Remove parent, element, viewer from saved node
      delete savedNode.data?.parent;
      delete savedNode.data?.element;
      delete savedNode.data?.viewer;

      nodeKeys.set(savedNode.key, savedNode);

      let sizeKey = 'width';

      const parentNodeElement = node.data.parent?.data?.element;
      const nodeElement = node?.data?.element;

      if (node?.data?.parent?.data?.flexDirection === 'column') {
        sizeKey = 'height';
      }
      
      // Assign new size value
      if (parentNodeElement && nodeElement) {
        const size = (nodeElement.getBoundingClientRect()[sizeKey] / parentNodeElement.getBoundingClientRect()[sizeKey]) * 100.0;
        savedNode.data.size = size;
      }
      
      if (node?.data?.parent) {
        const savedParentNode = nodeKeys.get(node.data.parent.key);
        savedParentNode.children.push(savedNode);
      }
    });

    return nodeKeys.get('root');
  }

  loadView() {

  }

  buildView(options) {
    this.options = options;
    this.buildContainers();
    this.buildResizers();
  }

  
  parallelSizeUpdate(draggingNode, overedNode, position) {
    // Update styles    
    const draggingContainer = draggingNode.data.element;
    const overedContainer = overedNode.data.element;

    draggingContainer.classList = overedContainer.classList;

    let sizeKey = 'width';
    
    if (position === 'top' || position === 'bottom') {
      sizeKey = 'height';
    }

    if (position && overedNode.data.parent.key !== draggingNode.data.parent.key) {      
      const originSize = overedContainer.getBoundingClientRect()[sizeKey]
      const calculatedSize = originSize - resizerSize;
      
      const totalSize = parseFloat(overedContainer.style[sizeKey]) * calculatedSize /  originSize;
      const size = totalSize / 2;

      // Remove previous size
      draggingContainer.style.removeProperty('width')
      draggingContainer.style.removeProperty('height')
    
      overedNode.data.size = size;
      overedContainer.style[sizeKey] = `${size}%`;

      draggingNode.data.size = size;
      draggingContainer.style[sizeKey] = `${size}%`;
    
      this.rebuildContainers();
    }

    // Update position (parent is also updated)
    if (position === 'right' || position === 'bottom') {
      this.tree.insertAfter(overedNode.data.parent.key, overedNode.key, draggingNode);
    }

    if (position === 'left' || position === 'top') {
      this.tree.insertBefore(overedNode.data.parent.key, overedNode.key, draggingNode);
    }
  }

  perpendicularSizeUpdate(draggingNode, overedNode, position) {
    let sizeKey = 'width';
    
    if (position === 'top' || position === 'bottom') {
      sizeKey = 'height';
    }
    
    // 1. Create wrapper node      
    const wrapperNode = new TreeNode(`${overedNode.key}${draggingNode.key}-${uuidv4()}`, {
      flexDirection: sizeKey === 'width' ? 'row' : 'column',
      type: 'wrapper',
      size: overedNode.data.size, // TODO: fix when overed node and dragging are from same parent
    });
    
    // 2. Create wrapper element
    const container = this.createContainer(wrapperNode);      
    container.style[overedNode.data.parent.data.flexDirection === 'row' ? 'width' : 'height'] = `${parseFloat(overedNode.data.size)}%`;

    // 3. Insert wrapper node into hovered node index
    const overedNodeIndex = overedNode.getRelativeIndex();
    this.tree.insertAt(overedNode.data.parent.key, wrapperNode, overedNodeIndex);

    if (position === 'left' || position === 'top') {
      wrapperNode.insert(draggingNode);
      wrapperNode.insert(overedNode);
    }
    
    if (position === 'right' || position === 'bottom') {
      wrapperNode.insert(overedNode);
      wrapperNode.insert(draggingNode);
    }

    // 4. Update size of children elements
    const mSizeKey = wrapperNode.data.flexDirection === 'row' ? 'width' : 'height';
    wrapperNode.children.forEach((childNode) => {              
      if (childNode.data.type === 'wrapper') return;
      
      childNode.data.flexDirection = 'row';
      childNode.data.size = 50;
      
      childNode.data.element.style.removeProperty('width')
      childNode.data.element.style.removeProperty('height')
      childNode.data.element.style[mSizeKey] = `${50}%`;      
    });      

    this.rebuildContainers();
  }
  
  // Update size of containers when all containers have been placed correctly
  formatView() {
    this.tree.depthFirstTraverse((node) => {      
      if (node.key === 'root') return;
      // move wrapper children if wrapper only has 1 child
      // move wrapper children if wrapper is parallel with parent and reappend children to new parent
      const newParentNode = node.data.parent
      if (
        (node.data.type === 'wrapper' && this.checkParallel(node, newParentNode)) ||
        (node.data.type === 'wrapper' && node.children.length === 1)
      ) {
        // 1. Update size of children in new parent
        const prevParentNode = node;
        const mSizeKey = newParentNode.data.flexDirection === 'row' ? 'width' : 'height';
        
        if (prevParentNode.children.length > 0) {
          const newParentSize = newParentNode.data.element.getBoundingClientRect()[mSizeKey];            
          const remainingSize = newParentNode.children.reduce((acc, childNode) => {
            if (childNode.key === prevParentNode.key) return acc;
            
            const rect = childNode.data.element.getBoundingClientRect();
            
            return acc - (rect[mSizeKey] + resizerSize);
          }, newParentSize);

          const remainingSizePercentage = (remainingSize / newParentSize) * 100;
          const totalChildrenNodes = prevParentNode.children.length || 1;
          
          prevParentNode.children.forEach((childNode) => {              
            if (childNode.data.type === 'wrapper') return;
            
            childNode.data.flexDirection = 'row';
            childNode.data.size = totalChildrenNodes === 1 ? remainingSizePercentage : parseFloat(childNode.data.size) / 100 * remainingSizePercentage;
            
            childNode.data.element.style.removeProperty('width')
            childNode.data.element.style.removeProperty('height')              
            
            childNode.data.element.style[mSizeKey] = `${childNode.data.size}%`;
          
          });
        }
        // 2. Check the index of the node within the parent
        const index = node.getRelativeIndex();
        
        // 3. Insert node children to node's parent (new) given index
        this.tree.insertAt(node.data.parent.key, node.children, index);          
        
        // 4. remove empty wrapper node
        if (node.data.type === 'wrapper' && node.children.length === 0) {          
          this.tree.remove(node.key);
        }
        
        // Must clean again since the tree structure changes
        this.formatView();
      }
    });

    // Rebuild view
    this.rebuildContainers();    
    this.rebuildResizers();
  }
  
  saveView() {
    const view = this.getView();
    localStorage.setItem('view_config', JSON.stringify(view));
  }

  static getSavedView() {
    const viewConfig = localStorage.getItem('view_config');    
    if (!viewConfig) return ContainerView.getDefaultTree();

    const treeView = JSON.parse(viewConfig);
    let tree;

    navigateTreeView(treeView, undefined, (node, parentKey) => {
      const treeNode = new TreeNode(node.key, {...node.data});
      
      if (node.key === 'root') {
        tree = new Tree(treeNode);
      }

      if (tree && parentKey) {
        tree.insert(parentKey, treeNode);        
      }
    });

    function navigateTreeView(treeViewNode, parentkey, callback) {
      callback?.(treeViewNode, parentkey);

      if (treeViewNode.children) {
        treeViewNode.children.forEach((child) => {
          navigateTreeView(child, treeViewNode.key, callback);         
        })
      }
    }

    return tree;
  }

  static getDefaultTree() {
    const rootNode = new TreeNode('root', { flexDirection: 'row', type: 'wrapper' });

    const node0 = new TreeNode('0', { flexDirection: 'row', viewerId: 'doc-viewer' });
    const node1 = new TreeNode('1', { flexDirection: 'column', type: 'wrapper' });

    const node2 = new TreeNode('2', { flexDirection: 'row', viewerId: 'translator-viewer' });
    const node3 = new TreeNode('3', { flexDirection: 'row', viewerId: 'images-viewer' });
    const node4 = new TreeNode('4', { flexDirection: 'row', viewerId: 'wiki-viewer' });

    const tree = new Tree(rootNode);

    tree.insert('root', node0);
    tree.insert('root', node1);
  
    node1.insert(node2);
    node1.insert(node3);
    // node1.insert(node4);

    return tree;
  }
}
