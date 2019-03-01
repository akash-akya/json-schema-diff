"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("util");
const create_json_set_1 = require("./set-factories/create-json-set");
const set_1 = require("./set/set");
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
        return set_1.allSchemaTypes;
    }
    if (typeof type === 'string') {
        return [type];
    }
    return type;
};
const parseRequiredKeyword = (schema) => schema.required || [];
const generateDefaultMinPropertiesKeyword = () => 0;
const generateDefaultMaxItemsKeyword = () => Infinity;
const parseMinItemsKeyword = (schema) => schema.minItems || 0;
const parseCoreSchemaMetaSchema = (schema) => create_json_set_1.createSomeJsonSet({
    additionalProperties: parseSchemaOrUndefinedAsJsonSet(schema.additionalProperties),
    items: parseSchemaOrUndefinedAsJsonSet(schema.items),
    maxItems: generateDefaultMaxItemsKeyword(),
    minItems: parseMinItemsKeyword(schema),
    minProperties: generateDefaultMinPropertiesKeyword(),
    properties: parseSchemaProperties(schema.properties),
    required: parseRequiredKeyword(schema),
    type: parseType(schema.type)
});
const parseBooleanSchema = (schema) => {
    const allowsAllJsonValues = util_1.isUndefined(schema) ? true : schema;
    return allowsAllJsonValues ? create_json_set_1.createAllJsonSet() : create_json_set_1.createEmptyJsonSet();
};
const parseSchemaOrUndefinedAsJsonSet = (schema) => {
    return (util_1.isBoolean(schema) || util_1.isUndefined(schema))
        ? parseBooleanSchema(schema)
        : parseCoreSchemaMetaSchema(schema);
};
exports.parseAsJsonSet = (schema) => {
    return parseSchemaOrUndefinedAsJsonSet(schema);
};
