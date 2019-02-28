"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const type_set_1 = require("./type-set");
class AllArraySet {
    constructor() {
        this.setType = 'array';
        this.type = 'all';
    }
    complement() {
        return exports.emptyArraySet;
    }
    intersect(other) {
        return other;
    }
    intersectWithSome(other) {
        return other;
    }
    toJsonSchema() {
        return { type: ['array'] };
    }
}
exports.AllArraySet = AllArraySet;
exports.allArraySet = new AllArraySet();
class EmptyArraySet {
    constructor() {
        this.setType = 'array';
        this.type = 'empty';
    }
    complement() {
        return exports.allArraySet;
    }
    intersect() {
        return this;
    }
    intersectWithSome() {
        return this;
    }
    toJsonSchema() {
        return false;
    }
}
exports.EmptyArraySet = EmptyArraySet;
exports.emptyArraySet = new EmptyArraySet();
class SomeArraySet {
    constructor(config) {
        this.config = config;
        this.setType = 'array';
        this.type = 'some';
    }
    complement() {
        // TODO: This should complement the minItems keyword, however cannot be tested without minItems support
        return new SomeArraySet({
            items: this.config.items.complement(),
            minItems: 1
        });
    }
    intersect(other) {
        return other.intersectWithSome(this);
    }
    intersectWithSome(other) {
        // TODO: Add support for intersecting minItems, need minItems to test:
        // {type: array, minItems: 1} -> {type: array, minItems: 2}
        // this will lead to us needing maxItem support
        return createArraySetFromConfig({
            items: this.config.items.intersect(other.config.items),
            minItems: this.config.minItems
        });
    }
    toJsonSchema() {
        return {
            items: this.config.items.toJsonSchema(),
            minItems: this.config.minItems,
            type: ['array']
        };
    }
}
exports.SomeArraySet = SomeArraySet;
const hasContradictions = (config) => {
    return config.items.type === 'empty' && config.minItems > 0;
};
const createArraySetFromConfig = (config) => hasContradictions(config)
    // TODO: Make this be the emptyArraySet, can't be tested, needs minItems support:
    //  {type: array, items: false, minItems: 1} -> {type: array, items: false}
    ? new type_set_1.EmptyTypeSet('array')
    : new SomeArraySet(config);
