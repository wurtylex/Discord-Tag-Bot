const RBTree = require('./RBTree.js');
const { Tags } = require('./database.js');  

class RBMaintainer {
    constructor() {
        this.tree = new RBTree();
        this.tags = Tags;
    }

    async initialize() {
        const tags = await this.tags.findAll({ attributes: ['id', 'times_tagged']});
        tags.forEach(async tag => { 
            this.tree.insert(tag.times_tagged + 1, tag.id);
        });
    }

    async upgrade(id) {
        const tag = await this.tags.findOne({ where: { id } });
        if (!tag) {
            return;
        }

        await this.tree.upgradeNode(tag.times_tagged + 1, id);
    }

    async printTree() {
        this.tree.printTree();
    }

    async insert(id) {
        this.tree.insert(1, id);
    }

    getInOrder() {
        return this.tree.getInOrder();
    }
}

const tree = new RBMaintainer(); 

module.exports = tree;