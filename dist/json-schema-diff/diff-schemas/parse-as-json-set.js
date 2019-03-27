"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const create_json_set_1 = require("./set-factories/create-json-set");
const keyword_defaults_1 = require("./set/keyword-defaults");
const parseSchemaProperties = (schemaProperties = {}) => {
    const objectSetProperties = {};
    for (const propertyName of Object.keys(schemaProperties)) {
        const propertySchema = schemaProperties[propertyName];
        objectSetProperties[propertyName] = parseSchemaOrUndefinedAsJsonSet(propertySchema);
    }
    return objectSetProperties;
};
const parseType = (type) => {
    if (!type) {
        return keyword_defaults_1.defaultTypes;
    }
    if (typeof type === 'string') {
        return [type];
    }
    return type;
};
const parseRequiredKeyword = (required) => required || keyword_defaults_1.defaultRequired;
const parseNumericKeyword = (keywordValue, defaultValue) => typeof keywordValue === 'number' ? keywordValue : defaultValue;
const parseCoreSchemaMetaSchema = (schema) => create_json_set_1.createSomeJsonSet({
    additionalProperties: parseSchemaOrUndefinedAsJsonSet(schema.additionalProperties),
    items: parseSchemaOrUndefinedAsJsonSet(schema.items),
    maxItems: parseNumericKeyword(schema.maxItems, keyword_defaults_1.defaultMaxItems),
    maxProperties: keyword_defaults_1.defaultMaxProperties,
    minItems: parseNumericKeyword(schema.minItems, keyword_defaults_1.defaultMinItems),
    minProperties: parseNumericKeyword(schema.minProperties, keyword_defaults_1.defaultMinProperties),
    properties: parseSchemaProperties(schema.properties),
    required: parseRequiredKeyword(schema.required),
    type: parseType(schema.type)
});
const parseBooleanSchema = (schema) => {
    const allowsAllJsonValues = schema === undefined ? true : schema;
    return allowsAllJsonValues ? create_json_set_1.createAllJsonSet() : create_json_set_1.createEmptyJsonSet();
};
const parseSchemaOrUndefinedAsJsonSet = (schema) => {
    return (typeof schema === 'boolean' || schema === undefined)
        ? parseBooleanSchema(schema)
        : parseCoreSchemaMetaSchema(schema);
};
exports.parseAsJsonSet = (schema) => {
    return parseSchemaOrUndefinedAsJsonSet(schema);
};
