import { TreeNode, Tree } from 'modules/tree';
import { initResizers } from 'modules/resizer';
import { initDragbox } from 'modules/dragbox';
import { ContainerView } from 'modules/container-view';

import { DocViewer } from 'views/doc-viewer';
import { TranslatorViewer } from 'views/translator-viewer';
import { ImagesViewer } from 'views/images-viewer';
import { WikiViewer } from 'views/wiki-viewer';

class Home {
  highlightedText;
  tree;
  containerView;
  
  constructor() {
    this.tree = this.getDefaultTree();
    this.containerView = new ContainerView(this.tree);
    this.containerView.buildView();  

    initDragbox(this.containerView, this.tree);
    initResizers(this.tree);

    this.tree.breadthFirstTraverse((node) => {      
      if (node.data.viewerId) {        
        const container = node.data.element.querySelector('.drag-box');        
        const viewer = document.getElementById(node.data.viewerId); // Get viewer template

        container.append(viewer)

        if (node.data.viewerId === 'doc-viewer') {
          node.data.viewer = new DocViewer(container);
        }
  
        if (node.data.viewerId === 'translator-viewer') {
          node.data.viewer = new TranslatorViewer(container);
        }

        if (node.data.viewerId === 'images-viewer') {
          node.data.viewer = new ImagesViewer(container);
        }

        if (node.data.viewerId === 'wiki-viewer') {
          node.data.viewer = new WikiViewer(container);
        }
      }
    })

  }
  
  getDefaultTree() {
    const rootNode = new TreeNode('root', { flexDirection: 'row', type: 'wrapper' });
    const tree = new Tree(rootNode);

    const node0 = new TreeNode('0', { flexDirection: 'row', viewerId: 'doc-viewer' });
    const node1 = new TreeNode('1', { flexDirection: 'column', type: 'wrapper' });
  
    tree.insert('root', node0);
    tree.insert('root', node1);
  
    const node2 = new TreeNode('2', { flexDirection: 'row', viewerId: 'translator-viewer' });
    const node3 = new TreeNode('3', { flexDirection: 'row', viewerId: 'images-viewer' });
    const node4 = new TreeNode('4', { flexDirection: 'row', viewerId: 'wiki-viewer' });
  
    node1.insert(node2);
    node1.insert(node3);
    node1.insert(node4);

    return tree;
  }
}
  
export const home = new Home()
  