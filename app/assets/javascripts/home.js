const rootNode = new TreeNode('root', { flexDirection: 'row', type: 'wrapper' });
const tree = new Tree(rootNode);

(function () {
  const node0 = new TreeNode('0', { flexDirection: 'row', viewId: 'doc-viewer' });
  const node1 = new TreeNode('1', { flexDirection: 'column', type: 'wrapper' });
  
  tree.insert('root', node0);
  tree.insert('root', node1);

  const node2 = new TreeNode('2', { flexDirection: 'row' });
  const node3 = new TreeNode('3', { flexDirection: 'row' });
  const node4 = new TreeNode('4', { flexDirection: 'row' });

  node1.insert(node2);
  node1.insert(node3);
  node1.insert(node4);
})()

const containerView = new ContainerView(tree);
containerView.buildView();  
