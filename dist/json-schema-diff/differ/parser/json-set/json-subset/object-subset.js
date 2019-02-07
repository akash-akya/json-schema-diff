"use strict";
// tslint:disable:max-classes-per-file
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const set_1 = require("../set");
const has_contradictions_1 = require("./object-subset/has-contradictions");
class AllObjectSubset {
    constructor(schemaOrigins, properties, additionalProperties) {
        this.schemaOrigins = schemaOrigins;
        this.properties = properties;
        this.additionalProperties = additionalProperties;
        this.type = 'all';
    }
    intersect(other) {
        return other.intersectWithAll(this);
    }
    intersectWithSome(other) {
        return intersectAllAndSome(this, other);
    }
    intersectWithAll(other) {
        return new AllObjectSubset(this.schemaOrigins.concat(other.schemaOrigins), intersectProperties(this, other), this.additionalProperties.intersect(other.additionalProperties));
    }
    intersectWithEmpty(other) {
        return intersectEmptyAndOther(other, this);
    }
    // TODO: this can return a simple empty when we remove origins
    complement() {
        const complementedProps = this.complementProperties();
        return [new EmptyObjectSubset(this.schemaOrigins, complementedProps, this.additionalProperties.complement())];
    }
    toJsonSchema() {
        return {
            'type': ['object'],
            'x-destination-origins': set_1.toDestinationOriginValues(this.schemaOrigins),
            'x-source-origins': set_1.toSourceOriginValues(this.schemaOrigins)
        };
    }
    getPropertyNames() {
        return Object.keys(this.properties);
    }
    getPropertySet(propertyName) {
        return this.properties[propertyName] ? this.properties[propertyName] : this.additionalProperties;
    }
    complementProperties() {
        const propertyNames = this.getPropertyNames();
        return propertyNames.reduce((acc, propertyName) => {
            acc[propertyName] = this.properties[propertyName].complement();
            return acc;
        }, {});
    }
}
exports.AllObjectSubset = AllObjectSubset;
class EmptyObjectSubset {
    constructor(schemaOrigins, properties, additionalProperties) {
        this.schemaOrigins = schemaOrigins;
        this.properties = properties;
        this.additionalProperties = additionalProperties;
        this.type = 'empty';
    }
    intersect(other) {
        return other.intersectWithEmpty(this);
    }
    intersectWithAll(other) {
        return intersectEmptyAndOther(this, other);
    }
    intersectWithSome(other) {
        return intersectEmptyAndOther(this, other);
    }
    intersectWithEmpty(other) {
        // TODO: this can't be asserted without keywords support
        return intersectEmptyAndOther(this, other);
    }
    complement() {
        const complementedProps = this.complementProperties();
        return [new AllObjectSubset(this.schemaOrigins, complementedProps, this.additionalProperties.complement())];
    }
    toJsonSchema() {
        return false;
    }
    getPropertySet(propertyName) {
        return this.properties[propertyName] ? this.properties[propertyName] : this.additionalProperties;
    }
    getPropertyNames() {
        return Object.keys(this.properties);
    }
    complementProperties() {
        const propertyNames = this.getPropertyNames();
        return propertyNames.reduce((acc, propertyName) => {
            acc[propertyName] = this.properties[propertyName].complement();
            return acc;
        }, {});
    }
}
exports.EmptyObjectSubset = EmptyObjectSubset;
class SomeObjectSubset {
    constructor(config) {
        this.config = config;
        this.type = 'some';
    }
    get additionalProperties() {
        return this.config.additionalProperties;
    }
    get properties() {
        return this.config.properties;
    }
    get schemaOrigins() {
        return this.config.schemaOrigins;
    }
    intersect(other) {
        return other.intersectWithSome(this);
    }
    intersectWithSome(other) {
        // TODO: delete schema origins
        return exports.createObjectSubsetFromConfig({
            additionalProperties: this.config.additionalProperties.intersect(other.config.additionalProperties),
            minProperties: intersectMinProperties(this.config.minProperties, other.config.minProperties),
            properties: intersectProperties(this, other),
            required: intersectRequired(this.config.required, other.config.required),
            schemaOrigins: this.config.schemaOrigins.concat(other.config.schemaOrigins)
        });
    }
    intersectWithAll(other) {
        return intersectAllAndSome(other, this);
    }
    intersectWithEmpty(other) {
        return intersectEmptyAndOther(other, this);
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
            'minProperties': this.config.minProperties.parsedValue,
            properties,
            'required': this.config.required.parsedValue,
            'type': ['object'],
            'x-destination-origins': set_1.toDestinationOriginValues(this.config.schemaOrigins),
            'x-source-origins': set_1.toSourceOriginValues(this.config.schemaOrigins)
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
                additionalProperties: this.config.additionalProperties.toAll(),
                // TODO: Untestable today, need:
                //  not: {properties: {name: {type: 'string'}, minProperties: 1, type: 'object'} -> true
                minProperties: Object.assign({}, this.config.minProperties, { parsedValue: 0 }),
                properties: { [propertyName]: complementedPropertySchema },
                required: {
                    origins: complementedPropertySchema.schemaOrigins,
                    parsedValue: [propertyName]
                },
                schemaOrigins: this.config.schemaOrigins
            });
        });
    }
    complementRequiredProperties() {
        return this.config.required.parsedValue.map((requiredPropertyName) => exports.createObjectSubsetFromConfig({
            additionalProperties: this.config.additionalProperties.toAll(),
            minProperties: { origins: [], parsedValue: 0 },
            properties: {
                [requiredPropertyName]: this.getPropertySet(requiredPropertyName).toEmpty()
            },
            required: {
                origins: [],
                parsedValue: []
            },
            schemaOrigins: this.schemaOrigins
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
            acc[propertyName] = this.config.properties[propertyName].toEmpty();
            return acc;
        }, {});
        return exports.createObjectSubsetFromConfig({
            additionalProperties: this.config.additionalProperties.complement(),
            minProperties: {
                origins: this.config.minProperties.origins,
                parsedValue: 1
            },
            properties: emptyProperties,
            required: Object.assign({}, this.config.required, { parsedValue: [] }),
            schemaOrigins: this.config.schemaOrigins
        });
    }
    complementAdditionalPropertiesWithRequired() {
        return exports.createObjectSubsetFromConfig({
            additionalProperties: this.config.additionalProperties.complement(),
            minProperties: {
                origins: this.config.minProperties.origins,
                parsedValue: 1 + Object.keys(this.config.properties).length
            },
            properties: this.config.properties,
            required: Object.assign({}, this.config.required, { parsedValue: Object.keys(this.config.properties) }),
            schemaOrigins: this.config.schemaOrigins
        });
    }
}
exports.SomeObjectSubset = SomeObjectSubset;
const intersectAllAndSome = (allObjectSet, someObjectSet) => {
    const mergedSchemaOrigins = allObjectSet.schemaOrigins.concat(someObjectSet.config.schemaOrigins);
    const mergedProperties = intersectProperties(allObjectSet, someObjectSet);
    const mergedAdditionalProperties = allObjectSet.additionalProperties
        .intersect(someObjectSet.config.additionalProperties);
    return exports.createObjectSubsetFromConfig({
        additionalProperties: mergedAdditionalProperties,
        minProperties: someObjectSet.config.minProperties,
        properties: mergedProperties,
        required: someObjectSet.config.required,
        schemaOrigins: mergedSchemaOrigins
    });
};
const intersectEmptyAndOther = (emptyObjectSet, otherObjectSet) => {
    const mergedSchemaOrigins = emptyObjectSet.schemaOrigins.concat(otherObjectSet.schemaOrigins);
    const mergedProperties = intersectProperties(emptyObjectSet, otherObjectSet);
    const mergedAdditionalProperties = emptyObjectSet.additionalProperties
        .intersect(otherObjectSet.additionalProperties);
    return new EmptyObjectSubset(mergedSchemaOrigins, mergedProperties, mergedAdditionalProperties);
};
const intersectMinProperties = (thisMinProperties, otherMinProperties) => {
    return {
        origins: [],
        // TODO: can't be asserted without minProperties support:
        //  {minProperties: 1, type: 'object'} -> {minProperties: 2, type: 'object'}
        parsedValue: Math.max(thisMinProperties.parsedValue, otherMinProperties.parsedValue)
    };
};
const getUniquePropertyNames = (thisPropertyNames, otherPropertyNames) => _.uniq(thisPropertyNames.concat(otherPropertyNames));
const intersectProperties = (objectSet1, objectSet2) => {
    const allPropertyNames = getUniquePropertyNames(objectSet1.getPropertyNames(), objectSet2.getPropertyNames());
    return allPropertyNames.reduce((accumulator, propertyName) => {
        accumulator[propertyName] = objectSet1.getPropertySet(propertyName)
            .intersect(objectSet2.getPropertySet(propertyName));
        return accumulator;
    }, {});
};
const intersectRequired = (thisRequired, otherRequired) => {
    return {
        origins: [],
        parsedValue: _.sortBy(_.uniq(thisRequired.parsedValue.concat(otherRequired.parsedValue)))
    };
};
exports.createObjectSubsetFromConfig = (config) => {
    return has_contradictions_1.hasContradictions(config)
        ? new EmptyObjectSubset(config.schemaOrigins, config.properties, config.additionalProperties.toEmpty())
        : new SomeObjectSubset(config);
};
