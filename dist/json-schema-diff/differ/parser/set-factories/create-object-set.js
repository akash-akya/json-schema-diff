"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const object_set_1 = require("../json-set/json-subset/object-set");
const object_subset_1 = require("../json-set/json-subset/object-subset");
const is_type_supported_1 = require("./is-type-supported");
const supportsAllObjects = (parsedSchemaKeywords) => {
    const everyPropertyIsAll = Object
        .keys(parsedSchemaKeywords.properties)
        .every((propertyName) => parsedSchemaKeywords.properties[propertyName].type === 'all');
    return everyPropertyIsAll
        && parsedSchemaKeywords.required.parsedValue.length === 0
        && parsedSchemaKeywords.additionalProperties.type === 'all';
};
const createObjectSubset = (parsedSchemaKeywords) => {
    if (!is_type_supported_1.isTypeSupported(parsedSchemaKeywords.type, 'object')) {
        return new object_subset_1.EmptyObjectSubset(parsedSchemaKeywords.type.origins, {}, parsedSchemaKeywords.additionalProperties);
    }
    const mergedOrigins = parsedSchemaKeywords.type.origins.concat(parsedSchemaKeywords.required.origins);
    if (supportsAllObjects(parsedSchemaKeywords)) {
        return new object_subset_1.AllObjectSubset(mergedOrigins, {}, parsedSchemaKeywords.additionalProperties);
    }
    return new object_subset_1.SomeObjectSubset({
        additionalProperties: parsedSchemaKeywords.additionalProperties,
        minProperties: parsedSchemaKeywords.minProperties,
        properties: parsedSchemaKeywords.properties,
        required: parsedSchemaKeywords.required,
        schemaOrigins: mergedOrigins
    });
};
exports.createObjectSet = (parsedSchemaKeywords) => {
    const objectSubset = createObjectSubset(parsedSchemaKeywords);
    return new object_set_1.ObjectSet([objectSubset]);
};
exports.allObjectSetFromJsonSet = (jsonSet) => {
    return new object_set_1.ObjectSet([new object_subset_1.AllObjectSubset(jsonSet.schemaOrigins, {}, jsonSet)]);
};
