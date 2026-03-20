
export function addDndBehavior(element, options) {
  const { onMoving, onEnded, onStart } = options;
  const body = document.getElementById('main-container');
  
  let clonedElement = null;
  let pos1, pos2, pos3, pos4;

  element.onmousedown = onDragBegin;
  element.ontouchstart = onDragBegin;

  function onDragBegin(e) {
    let clientPos;

    if (e.type === 'touchstart') {
      clientPos = e.touches[0];
    } else {
      e.preventDefault();
      clientPos = e;
    }

    pos3 = clientPos.clientX;
    pos4 = clientPos.clientY;

    const rect = element.getBoundingClientRect();      

    clonedElement = element.cloneNode(true); 
    
    clonedElement.style.zIndex = 100;
    clonedElement.style.position = 'absolute';
    clonedElement.style.top = rect.top + 'px';
    clonedElement.style.left = rect.left + 'px';
    clonedElement.style.width = 'fit-content';
    clonedElement.style.height = 'fit-content';
    
    body.append(clonedElement);

    document.onmouseup = onDragEnd;
    document.onmousemove = onDragging;

    document.ontouchend = onDragEnd;
    document.ontouchmove = onDragging;

    onStart?.(clonedElement);
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
    clonedElement.style.top = (clonedElement.offsetTop - pos2) + 'px';
    clonedElement.style.left = (clonedElement.offsetLeft - pos1) + 'px';

    onMoving?.(clonedElement, clientPos);
  }
    
  function onDragEnd(e) {
    /* stop moving when mouse button is released:*/
    if (e.type === 'touchend') {      
      onEnded?.(clonedElement, e.changedTouches[0]);
    } else {
      onEnded?.(clonedElement, e);
    }   

    document.onmouseup = null;
    document.onmousemove = null;
    
    document.ontouchend = null;
    document.ontouchmove = null;

    clonedElement.remove();
  }
}
