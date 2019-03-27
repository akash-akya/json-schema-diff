"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const keyword_defaults_1 = require("../keyword-defaults");
const omitDefaultAdditionalProperties = (schema) => {
    return schema.additionalProperties === true
        ? _.omit(schema, ['additionalProperties'])
        : schema;
};
const omitEmptyProperties = (schema) => {
    return _.isEqual(schema.properties, keyword_defaults_1.defaultProperties) ? _.omit(schema, ['properties']) : schema;
};
const omitEmptyRequired = (schema) => {
    return _.isEqual(schema.required, keyword_defaults_1.defaultRequired)
        ? _.omit(schema, ['required'])
        : schema;
};
const omitDefaultMaxProperties = (schema) => {
    return schema.maxProperties === keyword_defaults_1.defaultMaxProperties
        ? _.omit(schema, ['maxProperties'])
        : schema;
};
const omitDefaultMinProperties = (schema) => {
    return schema.minProperties === keyword_defaults_1.defaultMinProperties
        ? _.omit(schema, ['minProperties'])
        : schema;
};
const omitDefaultItems = (schema) => {
    return schema.items === true
        ? _.omit(schema, ['items'])
        : schema;
};
const omitDefaultMinItems = (schema) => {
    return schema.minItems === keyword_defaults_1.defaultMinItems
        ? _.omit(schema, ['minItems'])
        : schema;
};
const omitDefaultMaxItems = (schema) => {
    return schema.maxItems === keyword_defaults_1.defaultMaxItems
        ? _.omit(schema, ['maxItems'])
        : schema;
};
const omitDefaultsFromSchemaArray = (schemaArray) => schemaArray.map((schema) => exports.omitDefaults(schema));
const omitDefaultsFromAnyOfSchema = (schema) => {
    return schema.anyOf
        ? Object.assign({}, schema, { anyOf: omitDefaultsFromSchemaArray(schema.anyOf) }) : schema;
};
exports.omitDefaults = (originalSchema) => omitDefaultsFromAnyOfSchema(omitDefaultAdditionalProperties(omitEmptyProperties(omitEmptyRequired(omitDefaultMaxProperties(omitDefaultMinProperties(omitDefaultMinItems(omitDefaultMaxItems(omitDefaultItems(originalSchema)))))))));
