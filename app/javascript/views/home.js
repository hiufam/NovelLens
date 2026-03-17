import { TreeNode, Tree } from 'modules/tree';
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
    this.tree = this.getSavedView();    
    this.containerView = new ContainerView(this.tree);    
    this.containerView.buildView({
      onDragEnded: this.saveView.bind(this),
      onResizingEnded: this.saveView.bind(this)
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

  saveView() {
    const view = this.containerView.getView();
    localStorage.setItem('view_config', JSON.stringify(view));
  }

  getSavedView() {
    const viewConfig = localStorage.getItem('view_config');    
    if (!viewConfig) return this.#getDefaultTree();

    const treeView = JSON.parse(viewConfig);
    let tree;

    navigateTreeView(treeView, undefined, (node, parentKey) => {
      const treeNode = new TreeNode(node.key, {...node.data});
      
      if (node.key === 'root') {
        tree = new Tree(treeNode);
      }

      if (tree && parentKey) {
        tree.insert(parentKey, treeNode);        
      }
    });

    function navigateTreeView(treeViewNode, parentkey, callback) {
      callback?.(treeViewNode, parentkey);

      if (treeViewNode.children) {
        treeViewNode.children.forEach((child) => {
          navigateTreeView(child, treeViewNode.key, callback);         
        })
      }
    }
    
    return tree;
  }
  
  #getDefaultTree() {
    const rootNode = new TreeNode('root', { flexDirection: 'row', type: 'wrapper' });

    const node0 = new TreeNode('0', { flexDirection: 'row', viewerId: 'doc-viewer' });
    const node1 = new TreeNode('1', { flexDirection: 'column', type: 'wrapper' });

    const node2 = new TreeNode('2', { flexDirection: 'row', viewerId: 'translator-viewer' });
    const node3 = new TreeNode('3', { flexDirection: 'row', viewerId: 'images-viewer' });
    const node4 = new TreeNode('4', { flexDirection: 'row', viewerId: 'wiki-viewer' });

    const tree = new Tree(rootNode);

    tree.insert('root', node0);
    tree.insert('root', node1);
  
    node1.insert(node2);
    node1.insert(node3);
    node1.insert(node4);

    return tree;
  }
}
  
export const home = new Home()
  