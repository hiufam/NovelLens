export function getHoveredSide(element, e, offset = 32) {
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

export function isOver(elements, e) {
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
