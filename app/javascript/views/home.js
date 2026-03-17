import { ContainerView } from 'modules/container-view';

import { DocViewer } from 'views/doc-viewer';
import { TranslatorViewer } from 'views/translator-viewer';
import { ImagesViewer } from 'views/images-viewer';
import { WikiViewer } from 'views/wiki-viewer';

const viewerMap = {
  'doc-viewer': DocViewer,
  'translator-viewer':TranslatorViewer,
  'images-viewer': ImagesViewer,
  'wiki-viewer': WikiViewer,
}

class Home {
  highlightedText;
  tree;
  containerView;
  
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

        container.append(viewer)

        node.data.viewer = Reflect.construct(viewerMap[node.data.viewerId], [container, node]);
      }
    })
  }
}
  
export const home = new Home()
  