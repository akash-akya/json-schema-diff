"use strict";
// tslint:disable:max-classes-per-file
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const set_1 = require("../set");
const getUniquePropertyNames = (thisPropertyNames, otherPropertyNames) => _.uniq(thisPropertyNames.concat(otherPropertyNames));
class AllObjectSet {
    constructor(schemaOrigins, properties, additionalProperties) {
        this.schemaOrigins = schemaOrigins;
        this.properties = properties;
        this.additionalProperties = additionalProperties;
        this.setType = 'object';
        this.type = 'all';
    }
    intersect(other) {
        return other.intersectWithAll(this);
    }
    intersectWithSome(other) {
        return intersectAllAndSome(this, other);
    }
    intersectWithAll(other) {
        return new AllObjectSet(this.schemaOrigins.concat(other.schemaOrigins), intersectProperties(this, other), this.additionalProperties.intersect(other.additionalProperties));
    }
    intersectWithEmpty(other) {
        return intersectEmptyWithOtherObjectSet(other, this);
    }
    // TODO: this can't be asserted without keywords support
    complement() {
        return new EmptyObjectSet(this.schemaOrigins, complementProperties(this), this.additionalProperties.complement());
    }
    toRepresentations() {
        return [{
                destinationValues: set_1.toDestinationRepresentationValues(this.schemaOrigins),
                sourceValues: set_1.toSourceRepresentationValues(this.schemaOrigins),
                type: 'type',
                value: 'object'
            }];
    }
    getPropertyNames() {
        return Object.keys(this.properties);
    }
    getProperty(propertyName) {
        return this.properties[propertyName] ? this.properties[propertyName] : this.additionalProperties;
    }
}
exports.AllObjectSet = AllObjectSet;
class EmptyObjectSet {
    constructor(schemaOrigins, properties, additionalProperties) {
        this.schemaOrigins = schemaOrigins;
        this.properties = properties;
        this.additionalProperties = additionalProperties;
        this.setType = 'object';
        this.type = 'empty';
    }
    intersect(other) {
        return other.intersectWithEmpty(this);
    }
    intersectWithAll(other) {
        return intersectEmptyWithOtherObjectSet(this, other);
    }
    intersectWithSome(other) {
        return intersectEmptyWithOtherObjectSet(this, other);
    }
    intersectWithEmpty(other) {
        // TODO: this can't be asserted without keywords support
        return intersectEmptyWithOtherObjectSet(this, other);
    }
    complement() {
        return new AllObjectSet(this.schemaOrigins, complementProperties(this), this.additionalProperties.complement());
    }
    toRepresentations() {
        return [];
    }
    getProperty(propertyName) {
        return this.properties[propertyName] ? this.properties[propertyName] : this.additionalProperties;
    }
    getPropertyNames() {
        return Object.keys(this.properties);
    }
}
exports.EmptyObjectSet = EmptyObjectSet;
class SomeObjectSet {
    constructor(schemaOrigins, properties, additionalProperties) {
        this.schemaOrigins = schemaOrigins;
        this.properties = properties;
        this.additionalProperties = additionalProperties;
        this.setType = 'object';
        this.type = 'some';
    }
    intersect(other) {
        return other.intersectWithSome(this);
    }
    intersectWithSome(other) {
        // TODO: mergedSchemaOrigins can't be properly asserted without keywords support
        const mergedSchemaOrigins = this.schemaOrigins.concat(other.schemaOrigins);
        const mergedProperties = intersectProperties(this, other);
        const mergedAdditionalProperties = this.additionalProperties.intersect(other.additionalProperties);
        return new SomeObjectSet(mergedSchemaOrigins, mergedProperties, mergedAdditionalProperties);
    }
    intersectWithAll(other) {
        return intersectAllAndSome(other, this);
    }
    intersectWithEmpty(other) {
        return intersectEmptyWithOtherObjectSet(other, this);
    }
    complement() {
        return new SomeObjectSet(this.schemaOrigins, complementProperties(this), this.additionalProperties.complement());
    }
    toRepresentations() {
        const representations = [];
        this.getPropertyNames().forEach((property) => {
            representations.push(...this.properties[property].toRepresentations());
        });
        representations.push(...this.additionalProperties.toRepresentations());
        representations.push({
            destinationValues: set_1.toDestinationRepresentationValues(this.schemaOrigins),
            sourceValues: set_1.toSourceRepresentationValues(this.schemaOrigins),
            type: 'type',
            value: 'object'
        });
        return representations;
    }
    getProperty(propertyName) {
        return this.properties[propertyName] ? this.properties[propertyName] : this.additionalProperties;
    }
    getPropertyNames() {
        return Object.keys(this.properties);
    }
}
exports.SomeObjectSet = SomeObjectSet;
const intersectProperties = (objectSet1, objectSet2) => {
    const mergedProperties = {};
    const allPropertyNames = getUniquePropertyNames(objectSet1.getPropertyNames(), objectSet2.getPropertyNames());
    allPropertyNames.forEach((propertyName) => {
        mergedProperties[propertyName] = objectSet1.getProperty(propertyName)
            .intersect(objectSet2.getProperty(propertyName));
    });
    return mergedProperties;
};
const intersectAllAndSome = (allObjectSet, someObjectSet) => {
    const mergedSchemaOrigins = allObjectSet.schemaOrigins.concat(someObjectSet.schemaOrigins);
    const mergedProperties = intersectProperties(allObjectSet, someObjectSet);
    const mergedAdditionalProperties = allObjectSet.additionalProperties.intersect(someObjectSet.additionalProperties);
    return new SomeObjectSet(mergedSchemaOrigins, mergedProperties, mergedAdditionalProperties);
};
const intersectEmptyWithOtherObjectSet = (emptyObjectSet, otherObjectSet) => {
    const mergedSchemaOrigins = emptyObjectSet.schemaOrigins.concat(otherObjectSet.schemaOrigins);
    const mergedProperties = intersectProperties(emptyObjectSet, otherObjectSet);
    const mergedAdditionalProperties = emptyObjectSet.additionalProperties
        .intersect(otherObjectSet.additionalProperties);
    return new EmptyObjectSet(mergedSchemaOrigins, mergedProperties, mergedAdditionalProperties);
};
const complementProperties = (objectSet) => {
    const complementedProperties = {};
    objectSet.getPropertyNames().forEach((property) => {
        complementedProperties[property] = objectSet.properties[property].complement();
    });
    return complementedProperties;
};
