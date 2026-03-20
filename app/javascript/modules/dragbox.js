export function addDragBoxBehavior(area, containerView, options = {}) {
  const { onEnded } = options;    
  const mainContainer = document.getElementById('main-container');

  let hoveredElement = null;
  let hoveredSide = null;
  let pos1, pos2, pos3, pos4;
  let areas;
  let tree = containerView.tree;

  function addDragBehavior(element) {
    let header = null;
    let clonedHeader = null;
    if (element.querySelector('.drag-area')) {
      header = element.querySelector('.drag-area');
      header.onmousedown = onDragBegin;
      header.ontouchstart = onDragBegin;
    }

    function onDragBegin(e) {      
      e.preventDefault();
      let clientPos;

      if (e.type === 'touchstart') {
        clientPos = e.touches[0];
      } else {
        clientPos = e;
      }

      pos3 = clientPos.clientX;
      pos4 = clientPos.clientY;
      
      areas = document.getElementsByClassName('drag-box');

      const rect = element.getBoundingClientRect();      

      clonedHeader = header.cloneNode(true); 
      
      clonedHeader.style.position = 'absolute';
      clonedHeader.style.top = rect.top + 'px';
      clonedHeader.style.left = rect.left + 'px';
      
      mainContainer.append(clonedHeader);

      document.onmouseup = onDragEnd;
      document.onmousemove = onDragging;

      document.ontouchend = onDragEnd;
      document.ontouchmove = onDragging;
    }
    
    function onDragging(e) {
      let clientPos;
      if (e.type === 'touchmove') {
        clientPos = e.touches[0];
      } else {
        e.preventDefault();
        clientPos = e;
      }
      
      // calculate the new cursor position:
      pos1 = pos3 - clientPos.clientX;
      pos2 = pos4 - clientPos.clientY;
      pos3 = clientPos.clientX;
      pos4 = clientPos.clientY;
      // set the element's new position:
      clonedHeader.style.top = (clonedHeader.offsetTop - pos2) + 'px';
      clonedHeader.style.left = (clonedHeader.offsetLeft - pos1) + 'px';
    
      // Check if hover over an area
      hoveredElement = isOver(Array.from(areas), clientPos);
      hoveredSide = getHoveredSide(hoveredElement, clientPos);
    }
    
    function onDragEnd() {
      /* stop moving when mouse button is released:*/
      document.onmouseup = null;
      document.onmousemove = null;
      
      document.ontouchend = null;
      document.ontouchstart = null;
      
      clonedHeader.remove();      
      handleDragEnd(hoveredElement, element, hoveredSide);
      onEnded?.();
    }
  }

  function handleDragEnd(overedElement, draggingElement, position) {
    const overedElementNodeId = overedElement.id.split('-').slice(2).join('-');
    const overedNode = tree.findNode(overedElementNodeId);

    const draggingElementNodeId = draggingElement.id.split('-').slice(2).join('-');    
    const draggingNode = tree.findNode(draggingElementNodeId);

    containerView.updateDDContainers(overedNode, draggingNode, position);
    containerView.formatView();
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
  addDragBehavior(area);
}
