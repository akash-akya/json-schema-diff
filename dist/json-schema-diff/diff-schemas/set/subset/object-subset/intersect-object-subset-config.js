"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const object_subset_config_1 = require("./object-subset-config");
const unique_1 = require("./unique");
const intersectMinProperties = (configA, configB) => Math.max(configA.minProperties, configB.minProperties);
const intersectProperties = (configA, configB) => {
    const allPropertyNames = unique_1.unique(object_subset_config_1.getPropertyNames(configA), object_subset_config_1.getPropertyNames(configB));
    const intersectedProperties = {};
    for (const propertyName of allPropertyNames) {
        const propertySetA = object_subset_config_1.getPropertySet(configA, propertyName);
        const propertySetB = object_subset_config_1.getPropertySet(configB, propertyName);
        intersectedProperties[propertyName] = propertySetA.intersect(propertySetB);
    }
    return intersectedProperties;
};
const intersectRequired = (configA, configB) => unique_1.unique(configA.required, configB.required);
exports.intersectObjectSubsetConfig = (configA, configB) => ({
    additionalProperties: configA.additionalProperties.intersect(configB.additionalProperties),
    maxProperties: configA.maxProperties,
    minProperties: intersectMinProperties(configA, configB),
    properties: intersectProperties(configA, configB),
    required: intersectRequired(configA, configB)
});
