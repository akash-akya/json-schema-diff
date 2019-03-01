"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
class SetOfSubsets {
    constructor(setType, subsets) {
        this.setType = setType;
        this.subsets = subsets;
    }
    get type() {
        if (this.hasAtLeastOneSubsetOfType('all')) {
            return 'all';
        }
        if (this.hasAtLeastOneSubsetOfType('some')) {
            return 'some';
        }
        return 'empty';
    }
    complement() {
        const newSubsets = [];
        for (const subset of this.subsets) {
            newSubsets.push(...subset.complement());
        }
        return new SetOfSubsets(this.setType, newSubsets);
    }
    intersect(other) {
        const newSubsets = [];
        for (const thisSubset of this.subsets) {
            for (const otherSubset of other.subsets) {
                newSubsets.push(thisSubset.intersect(otherSubset));
            }
        }
        return new SetOfSubsets(this.setType, newSubsets);
    }
    toJsonSchema() {
        const schemas = this.subsets
            .filter((subset) => subset.type !== 'empty')
            .map((subset) => subset.toJsonSchema());
        const dedupedSchemas = _.uniqWith(schemas, _.isEqual);
        return { anyOf: dedupedSchemas };
    }
    hasAtLeastOneSubsetOfType(setType) {
        return this.subsets.some((subset) => subset.type === setType);
    }
}
exports.SetOfSubsets = SetOfSubsets;
