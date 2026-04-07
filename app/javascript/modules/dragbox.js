export function addDragBoxBehavior(node, area, containerView, options = {}) {
  const { onEnded } = options;    
  const mainContainer = document.getElementById('main-container');
  const viewerOverlay = document.getElementById('viewer-overlay');
  const sharedViews = document.getElementById('shared-views');

  let hoveredElement = null;
  let hoveredSide = null;
  let pos1, pos2, pos3, pos4;
  let areas = document.getElementsByClassName('drag-box');
  let tree = containerView.tree;

  function addDragBehavior(element) {
    let header = null;
    let clonedHeader = null;
    if (element.querySelector('.drag-area')) {
      header = element.querySelector('.drag-area');
      header.onmousedown = onDragBegin;
      header.addEventListener('touchstart', onDragBegin.bind(this), { passive: false });
    }

    function onDragBegin(e) {
      if (!node?.data?.moveEnabled) return;

      e.preventDefault();
      let clientPos;

      if (e.type === 'touchstart') {
        clientPos = e.touches[0];
      } else {
        clientPos = e;
      }

      pos3 = clientPos.clientX;
      pos4 = clientPos.clientY;

      
      clonedHeader = header.cloneNode(true); 
      
      clonedHeader.style.position = 'absolute';
      clonedHeader.style.zIndex = 100;
      clonedHeader.style.width = 'fit-content';
      clonedHeader.style.height = 'fit-content';
      clonedHeader.style.backgroundColor = 'var(--bs-primary)';
      clonedHeader.style.color = 'white';
      clonedHeader.style.padding = '6px';
      clonedHeader.style.borderRadius = '6px';
      clonedHeader.style.boxShadow = '5px 6px #8888888b';      
      clonedHeader.style.top = clientPos.clientY - 36 + 'px';
      clonedHeader.style.left =  clientPos.clientX - 48 + 'px';

      mainContainer.append(clonedHeader);

      if (node.data.moveEnabled) {
        document.onmouseup = onDragEnd;
        document.onmousemove = onDragging;
  
        document.ontouchend = onDragEnd;
        document.ontouchmove = onDragging;
        // document.addEventListener('touchmove', onDragging.bind(this), { passive: false });
      }
    }
    
    function onDragging(e) {
      e.preventDefault();

      let clientPos;
      if (e.type === 'touchmove') {
        clientPos = e.touches[0];
      } else {
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

      displayDropHint(clientPos);
    }

    function displayDropHint(pos) {
      const hoveredElement = isOver(Array.from(areas), pos);
      if (hoveredElement?.parentElement) {
        hoveredElement.append(viewerOverlay);
      }
    }
    
    function onDragEnd(e) {
      let clientPos;

      if (e.type === 'touchend') {
        clientPos = e.changedTouches[0];
      } else {
        e.preventDefault();
        clientPos = e;
      }

      areas = document.getElementsByClassName('drag-box');
      
      // Check if hover over an area
      hoveredElement = isOver(Array.from(areas), clientPos);
      hoveredSide = getHoveredSide(hoveredElement, clientPos);
      
      handleDragEnd(hoveredElement, element, hoveredSide);
      onEnded?.();
      
      clonedHeader.remove();
      
      /* stop moving when mouse button is released:*/
      document.onmouseup = null;
      document.onmousemove = null;
      
      document.ontouchend = null;
      document.ontouchmove = null;

      /* Put the overlay back to shared views */
      sharedViews.append(viewerOverlay);
    }
  }
  
  function handleDragEnd(overedElement, draggingElement, position) {
    if (!overedElement || !draggingElement) return;    

    const overedElementNodeId = overedElement.id.split('-').slice(2).join('-');
    const draggingElementNodeId = draggingElement.id.split('-').slice(2).join('-');

    const overedNode = tree.findNode(overedElementNodeId);
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
