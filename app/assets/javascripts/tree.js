class TreeNode {
  constructor(key, data) {
    this.key = key
    this.data = data;
    this.children = [];
  }

  insert(node) {
    this.children.push(node);
    node.data.parent = this;
  }

  // Index within parent children
  getRelativeIndex() {
    if (this.key === 'root') return 'root'
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

  insertAt(parentKey, nodes, index) {
    const node = Array.isArray(nodes) ? nodes[0] : nodes;
    const parentNode = this.findNode(parentKey);    

    const array = parentNode.children;
    const prevArray = node.data.parent.children;

    // remove node from previous parent
    const prevNodeIndex = [...prevArray].map((i) => i.key).indexOf(node.key);
    prevArray.splice(prevNodeIndex, 1);

    // assign to new parent
    node.data.parent = parentNode;
    if (Array.isArray(nodes)) {
      if (index < 0) {
        array.unshift(...nodes);
      } else if (index > array.length) {
        array.push(...nodes);
      } else {
        array.splice(index, 0, ...nodes);
      }
    } else {
      if (index < 0) {
        array.unshift(node);
      } else if (index > array.length) {
        array.push(node);
      } else {
        array.splice(index, 0, node);
      }
    }
    
    return array;
  }
  
  insertBefore(parentKey, nodeKey, node) {
    const parentNode = this.findNode(parentKey);
    const array = parentNode.children;

    const siblingNodeIndex = [...array].map((i) => i.key).indexOf(nodeKey);
    this.insertAt(parentKey, node, siblingNodeIndex);
  }

  insertAfter(parentKey, nodeKey, node) {    
    const parentNode = this.findNode(parentKey);    
    const array = parentNode.children;

    const siblingNodeIndex = [...array].map((i) => i.key).indexOf(nodeKey);
    this.insertAt(parentKey, node, siblingNodeIndex + 1);
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
