import { addResizingBehavior } from 'modules/resizer';
import { addDnDBehavior } from 'modules/dragbox';

export class ContainerView {
  #tree
  #resizers = [];
  #containers = [];
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
    this.#tree = tree
    this.options = options;

    this.rootContainer = this.createContainer(tree.root);
    this.rootContainer.style.height = '100%';
    
    this.mainContainer = document.getElementById('main-container');
    this.mainContainer.append(this.rootContainer);

    tree.root.data.element = this.rootContainer;
    
    this.dragbox = document.getElementById('shared-dragbox');
  }
  
  get tree() {
    return this.#tree
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
    const remainingSize = size - (parentNode.children.length - 1) * 8.0; // 8 is size of resizer    

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
  
  buildContainers() {
    this.#tree.breadthFirstTraverse((node, parentNode) => {
      if (node.key === 'root') return; 

      const dragContainerElement = this.createContainer(node);
      const clonedDragbox = this.dragbox.cloneNode(true);

      this.#containers.push(dragContainerElement);

      if (node.data.type !== 'wrapper') {
        clonedDragbox.id = `shared-dragbox-${node.key}`;
        const title = clonedDragbox.getElementsByTagName('span')[0];
        title.textContent = `Drag and drop - ${node.key}`;

        dragContainerElement.append(clonedDragbox);
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

    const areas = document.getElementsByClassName('drag-box');  
    addDnDBehavior(areas, this, this.tree, {
      onEnded: this.options?.onDragEnded,
    });
  }
  
  
  buildResizers() {
    this.#tree.breadthFirstTraverse((node, parentNode, isLastNode) => {
      if (node.key === 'root') return; 
      
      if (!isLastNode) {
        const resizer = this.createResizer(node, parentNode);
        node.data.element.after(resizer);
        this.#resizers.push(resizer);
      }
    });

    const resizers = document.getElementsByClassName('resizer');    
    addResizingBehavior(resizers, this.tree, {
      onEnded: this.options?.onResizingEnded,
    });
  }
  
  clearResizers() {
    this.#resizers.forEach((res) => {
      res.remove();
    })
    this.#resizers = [];
  }

  rebuildContainers() {
    const newContainers = [];
    this.#tree.breadthFirstTraverse((node, _) => {
      if (node.key === 'root') return;

      const parentNodeElement = node.data.parent.data.element;
      
      parentNodeElement.append(node.data.element);

      newContainers.push(node.data.element);
    });    
    const newContainersIds = newContainers.map((c) => c.id);    

    this.#containers.forEach((container) => {
      if (!newContainersIds.includes(container.id)) {
        container.remove();
      }      
    });

    this.#containers = newContainers;
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
}
