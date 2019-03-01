"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const omitDefaultAdditionalProperties = (schema) => {
    return schema.additionalProperties === true
        ? _.omit(schema, ['additionalProperties'])
        : schema;
};
const omitEmptyProperties = (schema) => {
    return schema.properties && Object.keys(schema.properties).length > 0
        ? schema
        : _.omit(schema, ['properties']);
};
const omitEmptyRequired = (schema) => {
    return schema.required && schema.required.length > 0
        ? schema
        : _.omit(schema, ['required']);
};
const omitDefaultMinProperties = (schema) => {
    return schema.minProperties === 0
        ? _.omit(schema, ['minProperties'])
        : schema;
};
const omitDefaultItems = (schema) => {
    return schema.items === true
        ? _.omit(schema, ['items'])
        : schema;
};
const omitDefaultMinItems = (schema) => {
    return schema.minItems === 0
        ? _.omit(schema, ['minItems'])
        : schema;
};
const omitDefaultMaxItems = (schema) => {
    return schema.maxItems === Infinity
        ? _.omit(schema, ['maxItems'])
        : schema;
};
const omitDefaultsFromSchemaArray = (schemaArray) => schemaArray.map((schema) => exports.omitDefaults(schema));
const omitDefaultsFromAnyOfSchema = (schema) => {
    return schema.anyOf
        ? Object.assign({}, schema, { anyOf: omitDefaultsFromSchemaArray(schema.anyOf) }) : schema;
};
exports.omitDefaults = (originalSchema) => omitDefaultsFromAnyOfSchema(omitDefaultAdditionalProperties(omitEmptyProperties(omitEmptyRequired(omitDefaultMinProperties(omitDefaultMinItems(omitDefaultMaxItems(omitDefaultItems(originalSchema))))))));
