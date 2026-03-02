(function() {    
  const mainContainer = document.getElementById('main-container');
  const areas = document.getElementsByClassName('drag-box');
  let hoveredElement = null;
  let hoveredSide = null;

  function addDragBehavior(element) {
    let header = null;
    let clonedHeader = null;
    if (element.querySelector('.drag-header')) {
      header = element.querySelector('.drag-header')
      header.onmousedown = onDragBegin;
    }

    function onDragBegin(e) {
      e.preventDefault();

      pos3 = e.clientX;
      pos4 = e.clientY;

      const rect = element.getBoundingClientRect();      

      clonedHeader = header.cloneNode(true); 
      
      clonedHeader.style.position = 'absolute';
      clonedHeader.style.top = rect.top + 'px';
      clonedHeader.style.left = rect.left + 'px';
      
      mainContainer.append(clonedHeader);

      document.onmouseup = onDragEnd;
      document.onmousemove = onDragging;
    }
    
    function onDragging(e) {
      e.preventDefault();
      // calculate the new cursor position:
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      // set the element's new position:
      clonedHeader.style.top = (clonedHeader.offsetTop - pos2) + 'px';
      clonedHeader.style.left = (clonedHeader.offsetLeft - pos1) + 'px';
    
      // Check if hover over an area
      hoveredElement = isOver(Array.from(areas), e);
      hoveredSide = getHoveredSide(hoveredElement, e);
    }
    
    function onDragEnd() {
      /* stop moving when mouse button is released:*/
      document.onmouseup = null;
      document.onmousemove = null;

      clonedHeader.remove();      
      handleDragEnd(hoveredElement, element, hoveredSide);
    }
  }

  function handleDragEnd(overedElement, draggingElement, position){    
    const overedElementNodeId = overedElement.id.split('-').at(-1);
    const overedNode = tree.findNode(overedElementNodeId);
    const overedContainer = overedNode.data.element;

    const draggingElementNodeId = draggingElement.id.split('-').at(-1);
    const draggingNode = tree.findNode(draggingElementNodeId);
    const draggingContainer = draggingNode.data.element;
    
    if (overedElementNodeId === draggingElementNodeId || !position) return;
    
    let isParallelWithParent = false;
    let sizeKey = 'width';
    
    if (position === 'top' || position === 'bottom') {
      sizeKey = 'height';
    }
    
    if ((position === 'right' || position === 'left') && overedNode.data.parent.data.flexDirection === 'row') {
      isParallelWithParent = true;
    }

    if ((position === 'top' || position === 'bottom') && overedNode.data.parent.data.flexDirection === 'column') {
      isParallelWithParent = true;
    }

    function parallelSizeUpdate() {
      // Update styles
      draggingContainer.classList = overedContainer.classList;

      if (position && overedNode.data.parent.key !== draggingNode.data.parent.key) {      
        const originSize = overedContainer.getBoundingClientRect()[sizeKey]
        const calculatedSize = originSize - 8; // 8 for size of resizer
        
        const totalSize = parseFloat(overedContainer.style[sizeKey]) * calculatedSize /  originSize;
        
        // Remove previous size
        draggingContainer.style.removeProperty('width')
        draggingContainer.style.removeProperty('height')
      
        overedNode.data.size = totalSize / 2;
        overedContainer.style[sizeKey] = `${overedNode.data.size}%`;

        draggingNode.data.size = totalSize / 2;
        draggingContainer.style[sizeKey] = `${draggingNode.data.size}%`;
      
        containerView.rebuildContainers();
      }

      // Update position (parent is also updated)
      if (position === 'right' || position === 'bottom') {
        tree.insertAfter(overedNode.data.parent.key, overedNode.key, draggingNode);
      }

      if (position === 'left' || position === 'top') {
        tree.insertBefore(overedNode.data.parent.key, overedNode.key, draggingNode);
      }
    }

    function perpendicularSizeUpdate() {
      // 1. Create wrapper node      
      const wrapperNode = new TreeNode(`${overedElementNodeId}${draggingElementNodeId}`, {
        flexDirection: sizeKey === 'width' ? 'row' : 'column',
        type: 'wrapper',
        size: overedNode.data.size,
      });
      
      // 2. Create wrapper element
      const container = containerView.createContainer(wrapperNode);      
      container.style[overedNode.data.parent.data.flexDirection === 'row' ? 'width' : 'height'] = `${parseFloat(overedNode.data.size)}%`;

      // 3. Insert wrapper node into hovered node index
      const overedNodeIndex = overedNode.getRelativeIndex();
      tree.insertAt(overedNode.data.parent.key, wrapperNode, overedNodeIndex);

      if (position === 'left' || position === 'bottom') {
        wrapperNode.insert(draggingNode);
        wrapperNode.insert(overedNode);
      }
      
      if (position === 'right' || position === 'top') {
        wrapperNode.insert(overedNode);
        wrapperNode.insert(draggingNode);
      }

      // 4. Update size of children elements
      const mSizeKey = wrapperNode.data.flexDirection === 'row' ? 'width' : 'height';
      wrapperNode.children.forEach((childNode) => {              
        if (childNode.data.type === 'wrapper') return;
        
        childNode.data.flexDirection = overedNode.data.flexDirection;
        childNode.data.size = 50;
        
        childNode.data.element.style.removeProperty('width')
        childNode.data.element.style.removeProperty('height')
        childNode.data.element.style[mSizeKey] = `${50}%`;      
      });      

      containerView.rebuildContainers();
    }

    // Update size of containers when all containers have been placed correctly
    function postSizeUpdate() {
      tree.depthFirstTraverse((node) => {      
        if (node.key === 'root') return;
        // move wrapper children if wrapper only has 1 child
        // move wrapper children if wrapper is parallel with parent and reappend children to new parent
        const newParentNode = node.data.parent
        if (
          (node.data.type === 'wrapper' && containerView.checkParallel(node, newParentNode)) ||
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
              
              return acc - (rect[mSizeKey] + 8);
            }, newParentSize);

            const remainingSizePercentage = (remainingSize / newParentSize) * 100;
            const totalChildrenNodes = prevParentNode.children.length || 1;
            
            prevParentNode.children.forEach((childNode) => {              
              if (childNode.data.type === 'wrapper') return;
              
              childNode.data.flexDirection = newParentNode.children[0].data.flexDirection;
              childNode.data.size = totalChildrenNodes === 1 ? remainingSizePercentage : parseFloat(childNode.data.size) / 100 * remainingSizePercentage;
              
              childNode.data.element.style.removeProperty('width')
              childNode.data.element.style.removeProperty('height')              
              
              childNode.data.element.style[mSizeKey] = `${childNode.data.size}%`;
            
            });
          }
          // 2. Check the index of the node within the parent
          const index = node.getRelativeIndex();
          
          // 3. Insert node children to node's parent (new) given index
          tree.insertAt(node.data.parent.key, node.children, index);          
          
          // 4. remove empty wrapper node
          if (node.data.type === 'wrapper' && node.children.length === 0) {          
            tree.remove(node.key);
          }
          
          // Must clean again since the tree structure changes
          postSizeUpdate();
        }
      });

      // Rebuild view
      containerView.rebuildContainers();    
      containerView.rebuildResizers();
    }
    
    
    // MAIN FUNCTION
    if (isParallelWithParent) {
      parallelSizeUpdate();
    } else {
      perpendicularSizeUpdate(); 
    }

    postSizeUpdate();

    Array.from(areas).forEach((area) => {  
      addDragBehavior(area);
    });
  }  

  function isOver(elements, e) {
    let hoveredElement = null; 
    elements.forEach((element)  => {      
      const rect = element.getBoundingClientRect();      
      
      var left = rect.x,
          top = rect.y,
          right = left + rect.width,
          bottom = top + rect.height;
          
      if (e.clientX > left && e.clientX < right && e.clientY > top && e.clientY < bottom ) {
        hoveredElement = element;
        return;
      }
    });

    return hoveredElement;
  };

  function getHoveredSide(element, e, offset = 32) {
    if (!element) return;

    const rect = element.getBoundingClientRect();      

    var x = e.clientX,
        y = e.clientY; 
    var left = rect.x,
        top = rect.y,
        right = left + rect.width,
        bottom = top + rect.height;
    
    if (top < y && y < top + offset) return 'top';
    if (bottom - offset < y && y < bottom) return 'bottom';
    if (left < x && x < left + offset) return 'left';
    if (right - offset < x && x < right) return 'right';
    return;
  }
  
  Array.from(areas).forEach((area) => {  
    addDragBehavior(area);
  });
})()
