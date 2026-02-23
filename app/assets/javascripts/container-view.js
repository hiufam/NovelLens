
class ContainerView {
  #tree
  #resizers = [];
  #containers = [];

  constructor(tree) {
    this.#tree = tree

    this.rootContainer = this.createDragContainer(tree.root);
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
    let sizeKey;
    let size;
    let containerElement = parentNode.data.element;
    if (parentNode.data.flexDirection == 'column') {
      size = containerElement.getBoundingClientRect().height;
      sizeKey = 'height'
    } else {
      size = containerElement.getBoundingClientRect().width;
      sizeKey = 'width'
    }

    // 8 is size of resizer
    const remainingSize = size - (parentNode.children.length - 1) * 8.0;

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
  createDragContainer(node) {
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
      
      const dragContainerElement = this.createDragContainer(node);
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
        // get element for node
        node.data.element = dragContainerElement;
      }
  
      if (parentNode?.children?.length > 0) {      
        const data = this.getDefaultChildContainerSizePercentage(parentNode);      
        dragContainerElement.style[data.sizeKey] = data.sizePercentage;
        // get size percentage for node
        node.data.size = data.sizePercentage;
      }
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
  }

  clearResizers() {
    this.#resizers.forEach((res) => {
      res.remove();
    })
    this.#resizers = [];
  }

  rebuildContainers() {
    this.#tree.breadthFirstTraverse((node, _) => {      
      if (node.key !== 'root') {
        node.data.element.remove();
      }

      if (node.data.type === 'wrapper' && node.children.length === 0) {
        node.data.element.remove();
      }
    })    

    this.buildContainers();
  }

  updateContainers(parentNode) {
    if (parentNode?.children?.length > 0) {
      const data = this.getDefaultChildContainerSizePercentage(parentNode);      

      parentNode?.children.forEach((child) => {
        const element = child.data.element;
        element.style[data.sizeKey] = data.sizePercentage;
        child.data.size = data.sizePercentage;
      })
    }
  }

  rebuildResizers() {
    this.clearResizers();
    this.buildResizers();

    // re-enable behaviors
    initResizers();
  }

  checkParallel(nodeA, nodeB) {
    let nodeADirection = 'row';
    let nodeBDirection = 'row';
    
    nodeADirection = nodeA?.data?.flexDirection ?? nodeADirection;
    nodeBDirection = nodeB?.data?.flexDirection ?? nodeBDirection;

    return nodeADirection === nodeBDirection;
  }

  saveView() {}
  buildView() {
    this.buildContainers();
    this.buildResizers();
  }
}
