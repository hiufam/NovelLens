import { TreeNode, Tree } from 'modules/tree';
import { ContainerView } from 'modules/container-view';
import { initResizers } from 'modules/resizer';
import { initDragbox } from 'modules/dragbox';

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
  }
  
  getDefaultTree() {
    const rootNode = new TreeNode('root', { flexDirection: 'row', type: 'wrapper' });
    const tree = new Tree(rootNode);

    const node0 = new TreeNode('0', { flexDirection: 'row', viewId: 'doc-viewer' });
    const node1 = new TreeNode('1', { flexDirection: 'column', type: 'wrapper' });
  
    tree.insert('root', node0);
    tree.insert('root', node1);
  
    const node2 = new TreeNode('2', { flexDirection: 'row', viewId: 'translator-viewer' });
    const node3 = new TreeNode('3', { flexDirection: 'row' });
    const node4 = new TreeNode('4', { flexDirection: 'row' });
  
    node1.insert(node2);
    node1.insert(node3);
    node1.insert(node4);

    return tree;
  }
}



// (function () {
  //   const node0 = new TreeNode('0', { flexDirection: 'row', viewId: 'doc-viewer' });
  //   const node1 = new TreeNode('1', { flexDirection: 'column', type: 'wrapper' });
  
  //   tree.insert('root', node0);
  //   tree.insert('root', node1);
  
  //   const node2 = new TreeNode('2', { flexDirection: 'row', viewId: 'translator-viewer' });
  //   const node3 = new TreeNode('3', { flexDirection: 'row' });
  //   const node4 = new TreeNode('4', { flexDirection: 'row' });
  
  //   node1.insert(node2);
  //   node1.insert(node3);
  //   node1.insert(node4);
  // })()
  
  export const home = new Home()
  