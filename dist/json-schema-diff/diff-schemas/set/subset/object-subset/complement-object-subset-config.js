"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const json_set_1 = require("../../json-set");
const keyword_defaults_1 = require("../../keyword-defaults");
const object_subset_config_1 = require("./object-subset-config");
const complementProperties = (config) => object_subset_config_1.getPropertyNames(config).map((propertyName) => {
    const complementedPropertySchema = object_subset_config_1.getPropertySet(config, propertyName).complement();
    return {
        additionalProperties: json_set_1.allJsonSet,
        maxProperties: keyword_defaults_1.defaultMaxProperties,
        minProperties: keyword_defaults_1.defaultMinProperties,
        properties: { [propertyName]: complementedPropertySchema },
        required: [propertyName]
    };
});
const complementRequiredProperties = (config) => config.required.map((requiredPropertyName) => ({
    additionalProperties: json_set_1.allJsonSet,
    maxProperties: keyword_defaults_1.defaultMaxProperties,
    minProperties: keyword_defaults_1.defaultMinProperties,
    properties: {
        [requiredPropertyName]: json_set_1.emptyJsonSet
    },
    required: keyword_defaults_1.defaultRequired
}));
const complementMinProperties = (config) => ({
    additionalProperties: json_set_1.allJsonSet,
    maxProperties: config.minProperties - 1,
    minProperties: keyword_defaults_1.defaultMinProperties,
    properties: {},
    required: keyword_defaults_1.defaultRequired
});
const complementAdditionalProperties = (config) => {
    const defaultComplementedAdditionalProperties = [complementAdditionalPropertiesWithEmpty(config)];
    return object_subset_config_1.getPropertyNames(config).length > 0
        ? defaultComplementedAdditionalProperties.concat(complementAdditionalPropertiesWithRequired(config))
        : defaultComplementedAdditionalProperties;
};
const complementAdditionalPropertiesWithEmpty = (config) => {
    const propertyNames = object_subset_config_1.getPropertyNames(config);
    const emptyProperties = {};
    for (const propertyName of propertyNames) {
        emptyProperties[propertyName] = json_set_1.emptyJsonSet;
    }
    return {
        additionalProperties: config.additionalProperties.complement(),
        maxProperties: keyword_defaults_1.defaultMaxProperties,
        minProperties: 1,
        properties: emptyProperties,
        required: keyword_defaults_1.defaultRequired
    };
};
const complementAdditionalPropertiesWithRequired = (config) => {
    const propertyNames = object_subset_config_1.getPropertyNames(config);
    return {
        additionalProperties: config.additionalProperties.complement(),
        maxProperties: keyword_defaults_1.defaultMaxProperties,
        minProperties: 1 + propertyNames.length,
        properties: keyword_defaults_1.defaultProperties,
        required: propertyNames
    };
};
exports.complementObjectSubsetConfig = (config) => {
    const complementedProperties = complementProperties(config);
    const complementedAdditionalProperties = complementAdditionalProperties(config);
    const complementedRequiredProperties = complementRequiredProperties(config);
    const complementedMinProperties = complementMinProperties(config);
    return [
        ...complementedAdditionalProperties,
        ...complementedProperties,
        ...complementedRequiredProperties,
        complementedMinProperties
    ];
};
