"use strict";
// tslint:disable:max-classes-per-file
Object.defineProperty(exports, "__esModule", { value: true });
const json_set_1 = require("../json-set");
const array_has_contradictions_1 = require("./array-subset/array-has-contradictions");
const subset_1 = require("./subset");
class SomeArraySubset {
    constructor(config) {
        this.config = config;
        this.setType = 'array';
        this.type = 'some';
    }
    complement() {
        // TODO: This should complement the maxItems keyword, however cannot be tested without maxItems support
        const complementedItems = this.complementItems();
        const complementedMinItems = this.complementMinItems();
        return [complementedItems, complementedMinItems];
    }
    intersect(other) {
        return other.intersectWithSome(this);
    }
    intersectWithSome(other) {
        return exports.createArraySubsetFromConfig({
            items: this.config.items.intersect(other.config.items),
            maxItems: this.config.maxItems,
            minItems: this.intersectMinItems(other)
        });
    }
    toJsonSchema() {
        return {
            items: this.config.items.toJsonSchema(),
            maxItems: this.config.maxItems,
            minItems: this.config.minItems,
            type: ['array']
        };
    }
    complementItems() {
        return exports.createArraySubsetFromConfig({
            items: this.config.items.complement(),
            maxItems: Infinity,
            minItems: 1
        });
    }
    complementMinItems() {
        return exports.createArraySubsetFromConfig({
            items: json_set_1.allJsonSet,
            maxItems: this.config.minItems - 1,
            minItems: 0
        });
    }
    intersectMinItems(other) {
        return Math.max(this.config.minItems, other.config.minItems);
    }
}
const simplifyArraySubsetConfig = (config) => config.maxItems === 0 ? Object.assign({}, config, { items: json_set_1.allJsonSet }) : config;
exports.allArraySubset = new subset_1.AllSubset('array');
exports.emptyArraySubset = new subset_1.EmptySubset('array');
exports.createArraySubsetFromConfig = (config) => {
    const simplifiedConfig = simplifyArraySubsetConfig(config);
    return array_has_contradictions_1.arrayHasContradictions(simplifiedConfig)
        ? exports.emptyArraySubset
        : new SomeArraySubset(simplifiedConfig);
};
