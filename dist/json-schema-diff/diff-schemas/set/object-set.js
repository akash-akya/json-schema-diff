"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
class ObjectSet {
    constructor(objectSubsets) {
        this.objectSubsets = objectSubsets;
    }
    get type() {
        if (this.hasAtLeastOneObjectSubsetOfType('all')) {
            return 'all';
        }
        if (this.hasAtLeastOneObjectSubsetOfType('some')) {
            return 'some';
        }
        return 'empty';
    }
    complement() {
        const newObjectSubsets = [];
        for (const objectSubset of this.objectSubsets) {
            newObjectSubsets.push(...objectSubset.complement());
        }
        return new ObjectSet(newObjectSubsets);
    }
    intersect(other) {
        const newObjectSubsets = [];
        for (const thisObjectSubset of this.objectSubsets) {
            for (const otherObjectSubset of other.objectSubsets) {
                newObjectSubsets.push(thisObjectSubset.intersect(otherObjectSubset));
            }
        }
        return new ObjectSet(newObjectSubsets);
    }
    toJsonSchema() {
        const schemas = this.objectSubsets
            .filter((objectSubset) => objectSubset.type !== 'empty')
            .map((objectSubset) => objectSubset.toJsonSchema());
        const dedupedSchemas = _.uniqWith(schemas, _.isEqual);
        return { anyOf: dedupedSchemas };
    }
    hasAtLeastOneObjectSubsetOfType(setType) {
        return this.objectSubsets.some((objectSubset) => objectSubset.type === setType);
    }
}
exports.ObjectSet = ObjectSet;
