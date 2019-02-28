"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const removeEmptyPropertiesObject = (schema) => {
    return schema.properties && Object.keys(schema.properties).length > 0
        ? schema
        : _.omit(schema, ['properties']);
};
const removeEmptyRequireProperty = (schema) => {
    return schema.required && schema.required.length > 0
        ? schema
        : _.omit(schema, ['required']);
};
const removeEmptyMinProperties = (schema) => {
    return schema.minProperties === 0
        ? _.omit(schema, ['minProperties'])
        : schema;
};
const removeEmptyMinItems = (schema) => {
    return schema.minItems === 0
        ? _.omit(schema, ['minItems'])
        : schema;
};
const sanitizeSchemaArray = (schemaArray) => schemaArray.map((schema) => exports.sanitizeCoreRepresentationJsonSchema(schema));
const sanitizeAnyOfSchema = (schema) => {
    return schema.anyOf
        ? Object.assign({}, schema, { anyOf: sanitizeSchemaArray(schema.anyOf) }) : schema;
};
exports.sanitizeCoreRepresentationJsonSchema = (originalSchema) => sanitizeAnyOfSchema(removeEmptyPropertiesObject(removeEmptyRequireProperty(removeEmptyMinProperties(removeEmptyMinItems(originalSchema)))));
