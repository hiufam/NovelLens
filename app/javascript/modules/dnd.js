
export function addDndBehavior(element, options) {
  const { onMoving, onEnded, onStart } = options;
  const body = document.getElementById('main-container');
  
  let clonedElement = null;
  let pos1, pos2, pos3, pos4;

  element.onmousedown = onDragBegin;

  function onDragBegin(e) {
    e.preventDefault();

    pos3 = e.clientX;
    pos4 = e.clientY;

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

    onStart?.(clonedElement);
  }

  function onDragging(e) {
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;

    // set the element's new position:
    clonedElement.style.top = (clonedElement.offsetTop - pos2) + 'px';
    clonedElement.style.left = (clonedElement.offsetLeft - pos1) + 'px';

    onMoving?.(clonedElement, e);
  }
    
  function onDragEnd(e) {
    /* stop moving when mouse button is released:*/
    document.onmouseup = null;
    document.onmousemove = null;

    onEnded?.(clonedElement, e);

    clonedElement.remove();
  }
}
