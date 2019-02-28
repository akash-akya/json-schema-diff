"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const isMinPropertiesBiggerThanDefinedProperties = (config) => {
    const numberOfDefinedPropertiesInSchema = Object.keys(config.properties)
        .map((propertyName) => config.properties[propertyName])
        .filter((propertySchema) => propertySchema.type !== 'empty')
        .length;
    return config.minProperties > numberOfDefinedPropertiesInSchema;
};
const areAdditionalPropertiesNotAllowed = (config) => config.additionalProperties.type === 'empty';
const isMinPropertiesAndAdditionalPropertiesContradiction = (config) => {
    return areAdditionalPropertiesNotAllowed(config) && isMinPropertiesBiggerThanDefinedProperties(config);
};
const isRequiredPropertyContradiction = (config) => {
    return config.required.some((propertyName) => {
        const propertySchema = config.properties[propertyName] || config.additionalProperties;
        return propertySchema.type === 'empty';
    });
};
exports.hasContradictions = (config) => {
    return isRequiredPropertyContradiction(config) || isMinPropertiesAndAdditionalPropertiesContradiction(config);
};
