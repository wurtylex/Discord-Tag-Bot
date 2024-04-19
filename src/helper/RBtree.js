const COLORS = {
    RED: 'RED',
    BLACK: 'BLACK',
};

class Node {
    constructor(param) {
        this.key = param.key || 0; 
        this.color = param.color || COLORS.RED;
        this.left = param.left || null;
        this.right = param.right || null;
        this.parent = param.parent || null;
        this.cnt = param.cnt || 1; 
    }
}

class RBTree {
    constructor() {
        this.leaf = new Node({ key: 0, color: COLORS.BLACK });
        this.root = this.leaf; 
    }

    printTree() {
        const stack = [
            { node: this.root, str: '' },
        ];
    
        while (stack.length) {
            const item = stack.pop();

            if (item.node == this.leaf) {
                continue;
            }

            let position = '';
            if (item.node.parent) {
                position = item.node === item.node.parent.left ? 'L----' : 'R----';
            } else {
                position = 'ROOT-';
            }

            console.log(`${item.str}${position} ${item.node.key} (${item.node.color}) - Count: ${item.node.cnt}`);
    
            stack.push({ node: item.node.right, str: item.str + '     ' });
            stack.push({ node: item.node.left, str: item.str + ' |   ' });
        }
    }

    /**
     * @param {number} key - key to insert
    */

    insert({key}) {
        const newNode = new Node({ key: key, left: this.leaf, right: this.leaf });

        let parent = null;
        let current = this.root;

        while (current !== this.leaf) {
            parent = current;
            if (newNode.key < current.key) {
                current = current.left;
            } else if (newNode.key > current.key) {
                current = current.right;
            } else {
                current.cnt++;
                return;
            }
        }

        newNode.parent = parent;

        if (parent === null) {
            this.root = newNode;
        } else if (newNode.key < parent.key) {
            parent.left = newNode;
        } else {
            parent.right = newNode;
        }

        if (!newNode.parent) { 
            newNode.color = COLORS.BLACK;
            return;
        }

        if (!newNode.parent.parent) {
            return;
        }

        this.fixInsert(newNode);
    }

    /**
     * @param {Node} node - rotation node
    */

    fixInsert(node) {
        let parent;
        let grandParent;

        while (node !== this.root && node.color !== COLORS.BLACK && node.parent.color === COLORS.RED) {
            parent = node.parent;
            grandParent = parent.parent;

            if (parent === grandParent.left) {
                const uncle = grandParent.right;

                if (uncle.color === COLORS.RED) {
                    grandParent.color = COLORS.RED;
                    parent.color = COLORS.BLACK;
                    uncle.color = COLORS.BLACK;
                    node = grandParent;
                } else {
                    if (node === parent.right) {
                        this.rotateLeft(parent);
                        node = parent;
                        parent = node.parent;
                    }

                    this.rotateRight(grandParent);
                    const temp = parent.color;
                    parent.color = grandParent.color;
                    grandParent.color = temp;
                    node = parent;
                }
            } else {
                const uncle = grandParent.left;

                if (uncle.color === COLORS.RED) {
                    grandParent.color = COLORS.RED;
                    parent.color = COLORS.BLACK;
                    uncle.color = COLORS.BLACK;
                    node = grandParent;
                } else {
                    if (node === parent.left) {
                        this.rotateRight(parent);
                        node = parent;
                        parent = node.parent;
                    }

                    this.rotateLeft(grandParent);
                    const temp = parent.color;
                    parent.color = grandParent.color;
                    grandParent.color = temp;
                    node = parent;
                }
            }
        }

        this.root.color = COLORS.BLACK;
    }

    /**
     * @param {Node} node - rotation node
    */

    rotateLeft(node) {
        const right = node.right;
        node.right = right.left;

        if (right.left !== this.leaf) {
            right.left.parent = node;
        }

        right.parent = node.parent;

        if (node.parent === null) {
            this.root = right;
        } else if (node === node.parent.left) {
            node.parent.left = right;
        } else {
            node.parent.right = right;
        }

        right.left = node;
        node.parent = right;
    }

    /**
     * @param {Node} node - rotation node
    */

    rotateRight(node) {
        const left = node.left;
        node.left = left.right;

        if (left.right !== this.leaf) {
            left.right.parent = node;
        }

        left.parent = node.parent;

        if (!node.parent) {
            this.root = left;
        } else if (node === node.parent.right) {
            node.parent.right = left;
        } else {
            node.parent.left = left;
        }

        left.right = node;
        node.parent = left;
    }

    /**
    * @param {Node} node - node of the tree where we should search the minimum value
    */

    minimum(node) {
        while (node.left != this.leaf) {
            node = node.left;
        }
        return node;
    }


    replace(node, child) {
        if (!node.parent) {
            this.root = child;
        } else if (node === node.parent.left) {
            node.parent.left = child;
        } else {
            node.parent.right = child;
        }

        child.parent = node.parent;
    }

    /**
     * @param {number} key - key to delete
    */

    deleteNode(key) {
        let forRemove = this.leaf;
        let tmp = this.root;
    
        while (tmp != this.leaf) {
            if (tmp.key === key) {
                forRemove = tmp;
                break;
            }
    
            if (tmp.key > key) {
                tmp = tmp.left;
            } else {
                tmp = tmp.right;
            }
        }

        if (forRemove == this.leaf) {
            return;
        }

        forRemove.cnt--;

        if (forRemove.cnt > 0) {
            return;
        }

        let minRight = forRemove;
        let minRightColor = minRight.color;
        let newMinRight;

        if (forRemove.left == this.leaf) {
            newMinRight = forRemove.right;
            this.replace(forRemove, forRemove.right);
        }
        else if (forRemove.right == this.leaf) {
            newMinRight = forRemove.left;
            this.replace(forRemove, forRemove.left);
        }
        else {
            minRight = this.minimum(forRemove.right);
            minRightColor = minRight.color;
            newMinRight = minRight.right;

            if (minRight.parent === forRemove) {
                newMinRight.parent = minRight;
            }

            else {
                this.replace(minRight, minRight.right);
                minRight.right = forRemove.right;
                minRight.right.parent = minRight;
            }

            this.replace(forRemove, minRight);
            minRight.left = forRemove.left;
            minRight.left.parent = minRight;
            minRight.color = forRemove.color;
        }

        if (minRightColor === COLORS.BLACK) {
            this.fixDelete(newMinRight);
        }
    }

    fixDelete(node) {
        let tmp;

        while (node !== this.root && node.color === COLORS.BLACK) {
            if (node === node.parent.left) {
                tmp = node.parent.right;

                if (tmp.color === COLORS.RED) {
                    tmp.color = COLORS.BLACK;
                    node.parent.color = COLORS.RED;
                    this.rotateLeft(node.parent);
                    tmp = node.parent.right;
                }

                if (tmp.left.color === COLORS.BLACK && tmp.right.color === COLORS.BLACK) {
                    tmp.color = COLORS.RED;
                    node = node.parent;
                } else {
                    if (tmp.right.color === COLORS.BLACK) {
                        tmp.left.color = COLORS.BLACK;
                        tmp.color = COLORS.RED;
                        this.rotateRight(tmp);
                        tmp = node.parent.right;
                    }

                    tmp.color = node.parent.color;
                    node.parent.color = COLORS.BLACK;
                    tmp.right.color = COLORS.BLACK;
                    this.rotateLeft(node.parent);
                    node = this.root;
                }
            } else {
                tmp = node.parent.left;

                if (tmp.color === COLORS.RED) {
                    tmp.color = COLORS.BLACK;
                    node.parent.color = COLORS.RED;
                    this.rotateRight(node.parent);
                    tmp = node.parent.left;
                }

                if (tmp.right.color === COLORS.BLACK && tmp.left.color === COLORS.BLACK) {
                    tmp.color = COLORS.RED;
                    node = node.parent;
                } else {
                    if (tmp.left.color === COLORS.BLACK) {
                        tmp.right.color = COLORS.BLACK;
                        tmp.color = COLORS.RED;
                        this.rotateLeft(tmp);
                        tmp = node.parent.left;
                    }

                    tmp.color = node.parent.color;
                    node.parent.color = COLORS.BLACK;
                    tmp.left.color = COLORS.BLACK;
                    this.rotateRight(node.parent);
                    node = this.root;
                }
            }
        }

        node.color = COLORS.BLACK;
    }
}

/*
const tree = new RBTree();
tree.insert({ key: 5 });
tree.insert({ key: 3 });
tree.insert({ key: 42 });
tree.insert({ key: 2 });
tree.insert({ key: 19 });
tree.insert({ key: 6 });
tree.insert({ key: 5 });
tree.insert({ key: 5 });

tree.printTree();

tree.deleteNode(5); 

tree.printTree();

tree.deleteNode(19);

tree.printTree();
*/

export default RBTree;