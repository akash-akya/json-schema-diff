"use strict";
// tslint:disable:max-classes-per-file
Object.defineProperty(exports, "__esModule", { value: true });
const array_subset_config_has_contradictions_1 = require("./array-subset/array-subset-config-has-contradictions");
const complement_array_subset_config_1 = require("./array-subset/complement-array-subset-config");
const intersect_array_subset_config_1 = require("./array-subset/intersect-array-subset-config");
const simplify_array_subset_config_1 = require("./array-subset/simplify-array-subset-config");
const subset_1 = require("./subset");
class SomeArraySubset {
    constructor(config) {
        this.config = config;
        this.setType = 'array';
        this.type = 'some';
    }
    complement() {
        return complement_array_subset_config_1.complementArraySubsetConfig(this.config).map(exports.createArraySubsetFromConfig);
    }
    intersect(other) {
        return other.intersectWithSome(this);
    }
    intersectWithSome(other) {
        return exports.createArraySubsetFromConfig(intersect_array_subset_config_1.intersectArraySubsetConfig(this.config, other.config));
    }
    toJsonSchema() {
        return {
            items: this.config.items.toJsonSchema(),
            maxItems: this.config.maxItems,
            minItems: this.config.minItems,
            type: ['array']
        };
    }
}
exports.allArraySubset = new subset_1.AllSubset('array');
exports.emptyArraySubset = new subset_1.EmptySubset('array');
exports.createArraySubsetFromConfig = (config) => {
    const simplifiedConfig = simplify_array_subset_config_1.simplifyArraySubsetConfig(config);
    return array_subset_config_has_contradictions_1.arraySubsetConfigHasContradictions(simplifiedConfig)
        ? exports.emptyArraySubset
        : new SomeArraySubset(simplifiedConfig);
};
