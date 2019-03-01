"use strict";
// tslint:disable:max-classes-per-file
Object.defineProperty(exports, "__esModule", { value: true });
const json_set_1 = require("../json-set");
const object_has_contradictions_1 = require("./object-subset/object-has-contradictions");
const unique_1 = require("./object-subset/unique");
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
        const complementedProperties = this.complementProperties();
        const complementedAdditionalProperties = this.complementAdditionalProperties();
        const complementedRequiredProperties = this.complementRequiredProperties();
        return [...complementedAdditionalProperties, ...complementedProperties, ...complementedRequiredProperties];
    }
    intersect(other) {
        return other.intersectWithSome(this);
    }
    intersectWithSome(other) {
        return exports.createObjectSubsetFromConfig({
            additionalProperties: this.config.additionalProperties.intersect(other.config.additionalProperties),
            minProperties: this.intersectMinProperties(other),
            properties: this.intersectProperties(other),
            required: this.intersectRequired(other)
        });
    }
    toJsonSchema() {
        const properties = this.toJsonSchemaMap();
        const additionalProperties = this.config.additionalProperties.toJsonSchema();
        return {
            additionalProperties,
            minProperties: this.config.minProperties,
            properties,
            required: this.config.required,
            type: ['object']
        };
    }
    getPropertySet(propertyName) {
        return this.config.properties[propertyName] || this.config.additionalProperties;
    }
    getPropertyNames() {
        return Object.keys(this.config.properties);
    }
    toJsonSchemaMap() {
        return this.getPropertyNames().reduce((acc, propertyName) => {
            acc[propertyName] = this.getPropertySet(propertyName).toJsonSchema();
            return acc;
        }, {});
    }
    complementProperties() {
        return this.getPropertyNames().map((propertyName) => {
            const complementedPropertySchema = this.getPropertySet(propertyName).complement();
            return exports.createObjectSubsetFromConfig({
                additionalProperties: json_set_1.allJsonSet,
                // TODO: Untestable today, need:
                //  not: {properties: {name: {type: 'string'}, minProperties: 1, type: 'object'} -> true
                minProperties: 0,
                properties: { [propertyName]: complementedPropertySchema },
                required: [propertyName]
            });
        });
    }
    complementRequiredProperties() {
        return this.config.required.map((requiredPropertyName) => exports.createObjectSubsetFromConfig({
            additionalProperties: json_set_1.allJsonSet,
            minProperties: 0,
            properties: {
                [requiredPropertyName]: json_set_1.emptyJsonSet
            },
            required: []
        }));
    }
    complementAdditionalProperties() {
        const defaultComplementedAdditionalProperties = [this.complementAdditionalPropertiesWithEmpty()];
        return this.getPropertyNames().length > 0
            ? defaultComplementedAdditionalProperties.concat(this.complementAdditionalPropertiesWithRequired())
            : defaultComplementedAdditionalProperties;
    }
    complementAdditionalPropertiesWithEmpty() {
        const propertyNames = this.getPropertyNames();
        const emptyProperties = propertyNames
            .reduce((acc, propertyName) => {
            acc[propertyName] = json_set_1.emptyJsonSet;
            return acc;
        }, {});
        return exports.createObjectSubsetFromConfig({
            additionalProperties: this.config.additionalProperties.complement(),
            minProperties: 1,
            properties: emptyProperties,
            required: []
        });
    }
    complementAdditionalPropertiesWithRequired() {
        return exports.createObjectSubsetFromConfig({
            additionalProperties: this.config.additionalProperties.complement(),
            minProperties: 1 + Object.keys(this.config.properties).length,
            // TODO: All the tests went green when I made this an empty object, whats up with that?
            properties: this.config.properties,
            required: Object.keys(this.config.properties)
        });
    }
    intersectMinProperties(other) {
        // TODO: can't be asserted without minProperties support:
        //  {minProperties: 1, type: 'object'} -> {minProperties: 2, type: 'object'}
        return Math.max(this.config.minProperties, other.config.minProperties);
    }
    intersectProperties(other) {
        const allPropertyNames = unique_1.unique(this.getPropertyNames(), other.getPropertyNames());
        return allPropertyNames.reduce((accumulator, propertyName) => {
            accumulator[propertyName] = this.getPropertySet(propertyName).intersect(other.getPropertySet(propertyName));
            return accumulator;
        }, {});
    }
    intersectRequired(other) {
        return unique_1.unique(this.config.required, other.config.required);
    }
}
exports.allObjectSubset = new subset_1.AllSubset('object');
exports.emptyObjectSubset = new subset_1.EmptySubset('object');
exports.createObjectSubsetFromConfig = (config) => {
    return object_has_contradictions_1.objectHasContradictions(config)
        ? exports.emptyObjectSubset
        : new SomeObjectSubset(config);
};
