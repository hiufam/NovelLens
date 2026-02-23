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
    const overedContainerParent = overedNode.data.parent;

    const draggingElementNodeId = draggingElement.id.split('-').at(-1);
    const draggingNode = tree.findNode(draggingElementNodeId);
    const draggingContainer = draggingNode.data.element;
    const draggingContainerParent = draggingNode.data.parent;

    let isParallelWithParent = false;

    if ((position === 'right' || position === 'left') && overedNode.data.parent.data.flexDirection === 'row') {
      isParallelWithParent = true;
    }

    if ((position === 'top' || position === 'bottom') && overedNode.data.parent.data.flexDirection === 'column') {
      isParallelWithParent = true;
    }

    
    if (isParallelWithParent) {
      // Update styles
      draggingContainer.classList = overedContainer.classList;

      // Update size
      const originSize = parseFloat(overedContainer.style.width);
      overedContainer.style.width = `${originSize / 2}%`;
      draggingContainer.style.width = `${originSize / 2}%`;
      
      if (position === 'right' || position === 'bottom') {
        // overedContainer.after(draggingContainer);
        tree.insertAfter(overedNode.data.parent.key, overedNode.key, draggingNode);
      }

      if (position === 'left' || position === 'top') {
        // overedContainer.before(draggingContainer);
        tree.insertBefore(overedNode.data.parent.key, overedNode.key, draggingNode);
      }

      tree.depthFirstTraverse((node) => {
        if (node.key === 'root') return;

        const parentNode = node.data.parent;

        // remove no-children wrapper node
        if (node.data.type === 'wrapper' && node.children.length === 0) {          
          parentNode.children = parentNode.children.filter((cNode) => cNode.key !== node.key)
        }

        // remove wrapper if wrapper only has 1 child
        if (node.data.type === 'wrapper' && node.children.length === 1) {          
          parentNode.children = parentNode.children.filter((cNode) => cNode.key !== node.key)
        }

        // remove wrapper if parallel with parent and reappend children to new parent
        if (node.data.type === 'wrapper' && containerView.checkParallel(node, parentNode)) {
          console.log(node);
          console.log(parentNode);
        }
      });

      containerView.rebuildContainers();
      containerView.rebuildResizers();

      Array.from(areas).forEach((area) => {  
        addDragBehavior(area);
      });
    } else {
 
    }
    // console.log(tree);
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
