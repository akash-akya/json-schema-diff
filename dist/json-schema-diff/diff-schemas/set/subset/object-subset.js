"use strict";
// tslint:disable:max-classes-per-file
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const json_set_1 = require("../json-set");
const has_contradictions_1 = require("./object-subset/has-contradictions");
class AllObjectSubset {
    constructor() {
        this.type = 'all';
    }
    intersect(other) {
        return other;
    }
    intersectWithSome(other) {
        return other;
    }
    complement() {
        return [exports.emptyObjectSubset];
    }
    toJsonSchema() {
        return { type: ['object'] };
    }
}
exports.AllObjectSubset = AllObjectSubset;
exports.allObjectSubset = new AllObjectSubset();
class EmptyObjectSubset {
    constructor() {
        this.type = 'empty';
    }
    intersect() {
        return this;
    }
    intersectWithSome() {
        return this;
    }
    complement() {
        return [exports.allObjectSubset];
    }
    toJsonSchema() {
        return false;
    }
}
exports.EmptyObjectSubset = EmptyObjectSubset;
exports.emptyObjectSubset = new EmptyObjectSubset();
class SomeObjectSubset {
    constructor(config) {
        this.config = config;
        this.type = 'some';
    }
    static intersectRequired(thisRequired, otherRequired) {
        return _.sortBy(_.uniq(thisRequired.concat(otherRequired)));
    }
    static intersectMinProperties(thisMinProperties, otherMinProperties) {
        // TODO: can't be asserted without minProperties support:
        //  {minProperties: 1, type: 'object'} -> {minProperties: 2, type: 'object'}
        return Math.max(thisMinProperties, otherMinProperties);
    }
    static getUniquePropertyNames(thisPropertyNames, otherPropertyNames) {
        return _.uniq(thisPropertyNames.concat(otherPropertyNames));
    }
    static intersectProperties(objectSet1, objectSet2) {
        const allPropertyNames = SomeObjectSubset.getUniquePropertyNames(objectSet1.getPropertyNames(), objectSet2.getPropertyNames());
        return allPropertyNames.reduce((accumulator, propertyName) => {
            accumulator[propertyName] = objectSet1.getPropertySet(propertyName)
                .intersect(objectSet2.getPropertySet(propertyName));
            return accumulator;
        }, {});
    }
    get properties() {
        return this.config.properties;
    }
    intersect(other) {
        return other.intersectWithSome(this);
    }
    intersectWithSome(other) {
        return exports.createObjectSubsetFromConfig({
            additionalProperties: this.config.additionalProperties.intersect(other.config.additionalProperties),
            minProperties: SomeObjectSubset.intersectMinProperties(this.config.minProperties, other.config.minProperties),
            properties: SomeObjectSubset.intersectProperties(this, other),
            required: SomeObjectSubset.intersectRequired(this.config.required, other.config.required)
        });
    }
    complement() {
        const complementedProperties = this.complementProperties();
        const complementedAdditionalProperties = this.complementAdditionalProperties();
        const complementedRequiredProperties = this.complementRequiredProperties();
        return [...complementedAdditionalProperties, ...complementedProperties, ...complementedRequiredProperties];
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
            properties: this.config.properties,
            required: Object.keys(this.config.properties)
        });
    }
}
exports.SomeObjectSubset = SomeObjectSubset;
exports.createObjectSubsetFromConfig = (config) => {
    return has_contradictions_1.hasContradictions(config)
        ? exports.emptyObjectSubset
        : new SomeObjectSubset(config);
};
