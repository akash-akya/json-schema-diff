"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const sameOrigins = (origins = [], otherOrigins = []) => {
    return _.intersectionWith(origins, otherOrigins, _.isEqual).length === origins.length
        && origins.length === otherOrigins.length;
};
const removeRedundantOrigins = (jsonSchema) => {
    if (sameOrigins(jsonSchema['x-destination-origins'], jsonSchema['x-source-origins'])) {
        return _.omit(jsonSchema, ['x-destination-origins', 'x-source-origins']);
    }
    return jsonSchema;
};
const removeEmptyOrigins = (jsonSchema) => {
    ['x-source-origins', 'x-destination-origins'].forEach((propertyName) => {
        const sourceOrigins = jsonSchema[propertyName];
        if (sourceOrigins && sourceOrigins.length === 0) {
            delete jsonSchema[propertyName];
        }
    });
    return jsonSchema;
};
const removeEmptyPropertiesObject = (jsonSchema) => {
    return jsonSchema.properties && Object.keys(jsonSchema.properties).length > 0
        ? jsonSchema
        : _.omit(jsonSchema, ['properties']);
};
const removeEmptyRequireProperty = (jsonSchema) => {
    return jsonSchema.required && jsonSchema.required.length > 0
        ? jsonSchema
        : _.omit(jsonSchema, ['required']);
};
const removeEmptyMinProperties = (jsonSchema) => {
    return jsonSchema.minProperties === 0
        ? _.omit(jsonSchema, ['minProperties'])
        : jsonSchema;
};
const sanitizeSchemaArray = (schemaArray) => schemaArray.map((schema) => exports.sanitizeCoreDiffJsonSchema(schema));
const sanitizeAnyOfSchema = (jsonSchema) => {
    return jsonSchema.anyOf
        ? Object.assign({}, jsonSchema, { anyOf: sanitizeSchemaArray(jsonSchema.anyOf) }) : jsonSchema;
};
exports.sanitizeCoreDiffJsonSchema = (originalSchema) => sanitizeAnyOfSchema(removeRedundantOrigins(removeEmptyOrigins(removeEmptyPropertiesObject(removeEmptyRequireProperty(removeEmptyMinProperties(originalSchema))))));
