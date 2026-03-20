export function addResizingBehavior (resizers, tree, options) {  // Add behaviors
  Array.from(resizers).forEach((resizer) => {
    addBehavior(resizer, tree, options);
  });
}

function addBehavior(resizer, tree, options) {
  const { onEnded } = options;
  
  const parentContainer = resizer.closest(".areas-container");  
  const flexDirection = Array.from(parentContainer.classList).includes("vertical-container") ? 'column' : 'row';  

  let sizeKey = 'width';  

  if (flexDirection === 'column') {
    resizer.style.width = '100%';
    resizer.style.height = '8px';
    resizer.style.cursor = 'n-resize'
    sizeKey = 'height';
  }

  function onResize() {
    // Persisted values
    let childContainers = null;
    let childContainersIds = [];

    // Resizer attrs
    let resizers = null;
    let resizersIds = [];
    let resizerIndex = -1;
    
    let parentContainerSize = null;
    let parentKey = null;
    
    // Others
    let originPosition = 0;
    let offsetPosition = 0;
    let prevContainer = null;
    let nextContainer = null;
    
    let nextContainersQueue = [];
    let prevResizeDirection = 0;
    let prevPosition = 0;
    
    let prevContainerOriginSize = null;
    let nextContainerOriginSize = null;    
    
    let nextContainerIndex = undefined;
    let prevContainerIndex = undefined;
    
    const splitedId = resizer.id.split('-')

    resizerIndex = Number(splitedId[splitedId.length - 1]);
    parentKey = splitedId.slice(1, -1).join('-');
    
    function dragMouseDown(e) {
      e.preventDefault();
      const { clientX, clientY } = e;
      originPosition = sizeKey === 'width' ? clientX : clientY;
      
      // Initialize some values
      nextContainersQueue = [];
      prevResizeDirection = 0; // direction > 0: left to right or top to bottom and vice versa.
      prevPosition = originPosition;
      
      childContainers = parentContainer.querySelectorAll(`#${parentContainer.id} > .areas-container`); // ordered areas containers
      childContainersIds = Array.from(childContainers).map(child => child.id);
      
      resizers = parentContainer.querySelectorAll('.resizer'); // ordered areas containers
      resizersIds = Array.from(resizers).map(child => child.id);              
      
      parentContainerSize = parentContainer.getBoundingClientRect()[sizeKey];
      
      document.addEventListener('mouseup', closeaddDragBehavior)
      document.addEventListener('mousemove', elementDrag)

      document.addEventListener('touchend', closeaddDragBehavior)
      document.addEventListener('touchmove', elementDrag)
    }
    
    function resetDragPosition(newClientX) {
      // Remove existing origin size due to change in prev and next containers
      prevContainerOriginSize = null;
      nextContainerOriginSize = null;        
      
      // reset origin and offset for new next and prev containers
      originPosition = newClientX;
      offsetPosition = 0;
    }    
    
    function setContainerRelativeSize(container) {
      if (container && parentContainer) {
        const containerSize = container.getBoundingClientRect()[sizeKey];
        container.style[sizeKey] = containerSize / parentContainerSize * 100 + '%';
      }
    }      

    function elementDrag(e) {
      let clientPos;

      if (e.type === 'touchmove') {
        clientPos = e.touches[0];
      } else {
        clientPos = e;
      }

      const resizerRect = resizer.getBoundingClientRect();
      const resizerPosition = sizeKey === 'width' ? resizerRect.x + resizerRect.width / 2 : resizerRect.y + resizerRect.height / 2;

      const { clientX, clientY } = clientPos;
      const position = sizeKey === 'width' ? clientX : clientY
      const delta = position - prevPosition; // changes in x/y relative to prev cursor pos
      const resizeDirection = position - resizerPosition; // changes in x/y relative to resizer pos
      offsetPosition = position - originPosition; // direction and distance
            
      // Check when resize direction change relative to the resizer position  (still, wtf is going on?)
      if (prevResizeDirection * resizeDirection < 0) {
        // Flush the squashed containers queue
        nextContainersQueue = [];
        resetDragPosition(position);
      }

      if (delta > 0 && !nextContainersQueue.includes(resizerIndex + 1)) {
        nextContainersQueue.push(resizerIndex + 1);
      }
      
      if (delta < 0 && !nextContainersQueue.includes(resizerIndex)) {
        nextContainersQueue.push(resizerIndex);
      }        

      prevContainerIndex = resizerIndex - 1 * Math.floor((prevResizeDirection - 1)  / 2);
      nextContainerIndex = nextContainersQueue[nextContainersQueue.length - 1];
              
      prevContainer = tree.findNode(parentKey).children[prevContainerIndex]?.data?.element;
      nextContainer = tree.findNode(parentKey).children[nextContainerIndex]?.data?.element;

      // Begin resizing
      if (!(delta === 0 || !prevContainer ||  !nextContainer ||  prevContainerIndex === nextContainerIndex)) {
        
        // Setting up prev and next containers      
        if (!prevContainerOriginSize && !nextContainerOriginSize) {               
          prevContainerOriginSize = prevContainer.getBoundingClientRect()[sizeKey];
          nextContainerOriginSize = nextContainer.getBoundingClientRect()[sizeKey];      
          
          prevContainer.style[sizeKey] = prevContainerOriginSize + 'px';
          nextContainer.style[sizeKey] = nextContainerOriginSize + 'px';
          
          prevContainer.style.flexGrow = '0';
          nextContainer.style.flexGrow = '0';
        }
  
        if (nextContainerOriginSize && prevContainerOriginSize) {
          const prevContainerSize = prevContainerOriginSize + offsetPosition * prevResizeDirection;
          const nextContainerSize = nextContainerOriginSize - offsetPosition * prevResizeDirection;      
          
          // Add lower bound for resizing
          if (prevContainerSize / parentContainerSize > 0.02 && nextContainerSize / parentContainerSize > 0.02) {
            // Change size
            prevContainer.style[sizeKey] = prevContainerSize + 'px';
            nextContainer.style[sizeKey] = nextContainerSize + 'px';
            
          } else { // When lower bound is reached            
            
            setContainerRelativeSize(prevContainer);
            setContainerRelativeSize(nextContainer);

            if (prevResizeDirection > 0) { // right/bottom bound
            } 
            if (prevResizeDirection < 0) { // left/top bound
            }
            // Add next container to queue
            const nContainerIndex = nextContainerIndex  + prevResizeDirection;
            if (!nextContainersQueue.includes(nContainerIndex) && nContainerIndex > -1 && nextContainerIndex < childContainersIds.length) {
              nextContainersQueue.push(nContainerIndex);
              resetDragPosition(position);
            }
          }
        }
      }

      prevResizeDirection = resizeDirection === 0 ? prevResizeDirection : resizeDirection / Math.abs(resizeDirection);
      prevPosition = sizeKey === 'width' ? clientX : clientY;
    }
    
    function closeaddDragBehavior() {
      document.removeEventListener('mouseup', closeaddDragBehavior);  
      document.removeEventListener('mousemove', elementDrag);

      document.removeEventListener('touchend', closeaddDragBehavior);  
      document.removeEventListener('touchmove', elementDrag);

      let lastContainer = null;

      Array.from(childContainers).forEach((container) => {
        const containerIndex = childContainersIds.indexOf(container.id);
        const isLastContainer = containerIndex === childContainersIds.length - 1;

        if (isLastContainer) {
          lastContainer = container;
        }
        setContainerRelativeSize(container);
        
        container.style.flexGrow = 0;
      });

      lastContainer.style.flexGrow = '1';

      // Reset some value
      originPosition = 0;
      offsetPosition = 0;
      prevContainer = null;
      nextContainer = null;

      nextContainersQueue = [];
      prevResizeDirection = 0;
      prevPosition = 0;
      
      prevContainerOriginSize = null;
      nextContainerOriginSize = null;    

      onEnded?.();
    }
    return dragMouseDown
  }

  resizer.addEventListener('mousedown', onResize())
  resizer.addEventListener('touchstart', onResize())
}
