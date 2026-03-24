
export function addDndBehavior(element, options) {
  const { onMoving, onEnded, onStart } = options;
  const body = document.getElementById('main-container');
  
  let clonedElement = null;
  let pos1, pos2, pos3, pos4;

  element.onmousedown = onDragBegin;
  element.addEventListener('touchstart', onDragBegin.bind(this), { passive: false });

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

    clonedElement = element.cloneNode(true); 

    clonedElement.style.position = 'absolute';
    clonedElement.style.zIndex = 100;
    clonedElement.style.width = 'fit-content';
    clonedElement.style.height = 'fit-content';
    clonedElement.style.backgroundColor = 'var(--bs-primary)';
    clonedElement.style.color = 'white';
    clonedElement.style.padding = '6px';
    clonedElement.style.borderRadius = '6px';
    clonedElement.style.boxShadow = '5px 6px #8888888b';      
    clonedElement.style.top = clientPos.clientY - 36 + 'px';
    clonedElement.style.left =  clientPos.clientX - 48 + 'px';
    
    body.append(clonedElement);

    document.onmouseup = onDragEnd;
    document.onmousemove = onDragging;

    document.ontouchend = onDragEnd;
    document.addEventListener('touchmove', onDragging.bind(this), { passive: false });

    onStart?.(clonedElement);
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
    clonedElement.style.top = (clonedElement.offsetTop - pos2) + 'px';
    clonedElement.style.left = (clonedElement.offsetLeft - pos1) + 'px';

    onMoving?.(clonedElement, clientPos);
  }
    
  function onDragEnd(e) {
    e.preventDefault();

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
