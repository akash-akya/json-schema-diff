"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const set_of_subsets_1 = require("../set/set-of-subsets");
const object_subset_1 = require("../set/subset/object-subset");
const is_type_supported_1 = require("./is-type-supported");
const supportsAllObjects = (objectSetParsedKeywords) => {
    // TODO: This should look at the minProperties keyword, but we need minProperties support to do that
    const everyPropertyIsAll = Object
        .keys(objectSetParsedKeywords.properties)
        .every((propertyName) => objectSetParsedKeywords.properties[propertyName].type === 'all');
    return everyPropertyIsAll
        && objectSetParsedKeywords.required.length === 0
        && objectSetParsedKeywords.additionalProperties.type === 'all';
};
const createObjectSubset = (objectSetParsedKeywords) => {
    if (!is_type_supported_1.isTypeSupported(objectSetParsedKeywords.type, 'object')) {
        return object_subset_1.emptyObjectSubset;
    }
    if (supportsAllObjects(objectSetParsedKeywords)) {
        return object_subset_1.allObjectSubset;
    }
    return object_subset_1.createObjectSubsetFromConfig({
        additionalProperties: objectSetParsedKeywords.additionalProperties,
        minProperties: objectSetParsedKeywords.minProperties,
        properties: objectSetParsedKeywords.properties,
        required: objectSetParsedKeywords.required
    });
};
exports.createObjectSet = (objectSetParsedKeywords) => {
    const objectSubset = createObjectSubset(objectSetParsedKeywords);
    return new set_of_subsets_1.SetOfSubsets('object', [objectSubset]);
};
