const rootNode = new TreeNode('root', { flexDirection: 'row', type: 'wrapper' });
const tree = new Tree(rootNode);

(function () {
  const node0 = new TreeNode('0', { flexDirection: 'row' });
  const node1 = new TreeNode('1', { flexDirection: 'row' });
  const node2 = new TreeNode('2', { flexDirection: 'row' });

  const node3 = new TreeNode('3', { flexDirection: 'column', type: 'wrapper' });
  
  tree.insert('root', node0);
  tree.insert('root', node1);
  tree.insert('root', node2);
  tree.insert('root', node3);

  const node4 = new TreeNode('4', { flexDirection: 'row' });
  const node5 = new TreeNode('5', { flexDirection: 'row' });
  const node6 = new TreeNode('6', { flexDirection: 'row', type: 'wrapper' });

  const node7 = new TreeNode('7', { flexDirection: 'row' });
  const node8 = new TreeNode('8', { flexDirection: 'row' });
  
  node3.insert(node6);
  node3.insert(node4);
  node3.insert(node5);

  node6.insert(node7);
  node6.insert(node8);
})()

const containerView = new ContainerView(tree);
containerView.buildView();  
