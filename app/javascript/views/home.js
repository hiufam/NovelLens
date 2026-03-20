import { ContainerView } from 'modules/container-view';
import { viewerMap } from 'constants/views'

class Home {
  highlightedText;
  tree;
  containerView;
  
  toggleHeaders = true;
  
  constructor() {
    this.tree = ContainerView.getSavedView();    
    this.containerView = new ContainerView(this.tree);    
    
    this.containerView.buildView({
      onDragEnded: this.containerView.saveView.bind(this.containerView),
      onResizingEnded: this.containerView.saveView.bind(this.containerView)
    });

    this.tree.breadthFirstTraverse((node) => {      
      if (node.data.viewerId) {
        const container = node.data.element.querySelector('.drag-box');        
        const viewer = document.getElementById(node.data.viewerId); // Get viewer template
        const clonedViewer = viewer.cloneNode(true);

        container.append(clonedViewer)

        node.data.viewer = Reflect.construct(viewerMap[node.data.viewerId].class, [container, node]);
      }
    })
  }
}
  
export const home = new Home()
  