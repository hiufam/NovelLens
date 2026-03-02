class TreeNode {
  constructor(key, data, children = []) {
    this.key = key
    this.data = data; // parent, element, flexDirection, type, rect
    this.children = children;
  }

  insert(node) {
    // If node already exist in tree
    if (node.data.parent) {
      node.data.parent.children.splice(node.getRelativeIndex(), 1);
    }

    this.children.push(node);
    node.data.parent = this;
  }

  // Index within parent children
  getRelativeIndex() {
    if (this.key === 'root') return 0;
    const children = this.data.parent.children;
    return [...children].map((i) => i.key).indexOf(this.key);
  }
}

class Tree {
  #root
  constructor(rootNode) {
    this.#root = rootNode ?? new TreeNode("root");
  }

  get root() {
    return this.#root
  }

  insert(parentKey, node) {
    const parentNode = this.findNode(parentKey);    
    parentNode.children.push(node);

    node.data.parent = parentNode;
  }

  remove(nodeKey) {
    const node = this.findNode(nodeKey);
    const parent = node.data.parent;

    parent.children.splice(node.getRelativeIndex(), 1);
  }

  insertAt(parentKey, node, index, callback) {
    const nodes = Array.isArray(node) ? node : [node];
    const parentNode = this.findNode(parentKey);

    nodes.forEach((cNode, i) => {      
      let offset = 0;
      const currentIndex = index + i;

      // node, newParent, prevParent
      callback?.(node, parentNode, node.data.parent);

      // Case: Same parent and new relative index is greater than previous relative index
      // Adding offset to counter act the deletion (moving the items back)
      if (cNode.data.parent && cNode.data.parent.key === parentKey && currentIndex >= node.getRelativeIndex()) {        
        offset = -1;
      }

      if (cNode.data.parent) {
        const prevArray = cNode.data.parent.children;
        // remove node from previous parent
        cNode.data.parent.children = [...prevArray].filter((aNode) => aNode.key !== cNode.key);
      }

      // assign to new parent
      cNode.data.parent = parentNode;

      if (currentIndex + offset < 0) {
        parentNode.children.unshift();
      } else if (currentIndex + offset > parentNode.children.length) {
        parentNode.children.push(cNode);
      } else {
        parentNode.children.splice(currentIndex + offset, 0, cNode);
      }
    });

        
    return parentNode.children;
  }
  
  insertBefore(parentKey, nodeKey, node, callback) {
    const parentNode = this.findNode(parentKey);
    const array = parentNode.children;

    const siblingNodeIndex = [...array].map((i) => i.key).indexOf(nodeKey);
    this.insertAt(parentKey, node, siblingNodeIndex, callback);
  }

  insertAfter(parentKey, nodeKey, node, callback) {    
    const parentNode = this.findNode(parentKey);    
    const array = parentNode.children;

    const siblingNodeIndex = [...array].map((i) => i.key).indexOf(nodeKey);
    this.insertAt(parentKey, node, siblingNodeIndex + 1, callback);
  }
  
  move(parentKey, nodeKey, index) {
    const parentNode = this.findNode(parentKey);    
    const node = this.findNode(nodeKey);    

    const array = parentNode.children;

    const keysArray = [...array].map((i) => i.key);
    const nodeIndex = keysArray.indexOf(node.key);

    const item = array.splice(nodeIndex, 1)[0];
    array.splice(index, 0, item);

    return array;
  }
 
  swapNode(keyA, keyB) {
    const nodeA = this.findNode(keyA);
    const nodeB = this.findNode(keyB);

    if (!nodeA || !nodeB) return;

    [nodeA.key, nodeB.key] = [nodeB.key, nodeA.key];
    [nodeA.data, nodeB.data] = [nodeB.data, nodeA.data];
  }

  findNode(key) {
    let foundNode; 
    this.breadthFirstTraverse((node) => {      
      if (node.key === key) {        
        foundNode = node;
        return true;
      }
    });

    return foundNode
  }

  setNodeData(key, data) {

  }

  depthFirstTraverse(callback) {    
    if (!this.#root) {
      return;
    }
    
    const stack = [this.#root];
    
    while (stack.length > 0) {
      const current = stack.pop();

      if (callback?.(current)) return;

      for (let i = current.children.length - 1; i >= 0; i--) {
        stack.push(current.children[i]);
      }
    }
  }

  breadthFirstTraverse(callback) {
    const bfsQueue = [this.#root];
    const lastNodeKeys = [];

    while (bfsQueue?.length > 0) {
      const node = bfsQueue.shift();
      
      // return it is last node also
      if (callback?.(node, node.data.parent, lastNodeKeys.includes(node.key))) return;
      
      if (node.children.length > 0) {
        bfsQueue.push(...node.children);
        lastNodeKeys.push(node.children[node.children.length - 1].key)
      }
    }
  }
}
