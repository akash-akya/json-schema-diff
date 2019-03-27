"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const complement_object_subset_config_1 = require("./object-subset/complement-object-subset-config");
const intersect_object_subset_config_1 = require("./object-subset/intersect-object-subset-config");
const object_subset_config_1 = require("./object-subset/object-subset-config");
const object_subset_config_has_contradictions_1 = require("./object-subset/object-subset-config-has-contradictions");
const subset_1 = require("./subset");
class SomeObjectSubset {
    constructor(config) {
        this.config = config;
        this.setType = 'object';
        this.type = 'some';
    }
    get properties() {
        return this.config.properties;
    }
    complement() {
        return complement_object_subset_config_1.complementObjectSubsetConfig(this.config).map(exports.createObjectSubsetFromConfig);
    }
    intersect(other) {
        return other.intersectWithSome(this);
    }
    intersectWithSome(other) {
        return exports.createObjectSubsetFromConfig(intersect_object_subset_config_1.intersectObjectSubsetConfig(this.config, other.config));
    }
    toJsonSchema() {
        const properties = this.toJsonSchemaMap();
        const additionalProperties = this.config.additionalProperties.toJsonSchema();
        return {
            additionalProperties,
            maxProperties: this.config.maxProperties,
            minProperties: this.config.minProperties,
            properties,
            required: this.config.required,
            type: ['object']
        };
    }
    toJsonSchemaMap() {
        return object_subset_config_1.getPropertyNames(this.config).reduce((acc, propertyName) => {
            acc[propertyName] = object_subset_config_1.getPropertySet(this.config, propertyName).toJsonSchema();
            return acc;
        }, {});
    }
}
exports.allObjectSubset = new subset_1.AllSubset('object');
exports.emptyObjectSubset = new subset_1.EmptySubset('object');
exports.createObjectSubsetFromConfig = (config) => {
    return object_subset_config_has_contradictions_1.objectSubsetConfigHasContradictions(config)
        ? exports.emptyObjectSubset
        : new SomeObjectSubset(config);
};
