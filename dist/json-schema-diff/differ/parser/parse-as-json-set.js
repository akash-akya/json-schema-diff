"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("util");
const set_1 = require("./json-set/set");
const schema_location_1 = require("./schema-location");
const create_json_set_1 = require("./set-factories/create-json-set");
const toSimpleTypeArray = (type) => {
    if (!type) {
        return set_1.allSchemaTypes;
    }
    if (typeof type === 'string') {
        return [type];
    }
    return type;
};
const parseSchemaProperties = (schemaProperties = {}, location) => {
    const objectSetProperties = {};
    for (const propertyName of Object.keys(schemaProperties)) {
        const propertySchema = schemaProperties[propertyName];
        const propertyLocation = location.child(propertyName);
        objectSetProperties[propertyName] = parseWithLocation(propertySchema, propertyLocation);
    }
    return objectSetProperties;
};
const parseType = (schema, location) => {
    const types = toSimpleTypeArray(schema.type);
    if (schema.type) {
        return {
            origins: [{
                    path: location.child('type').path,
                    type: location.schemaOriginType,
                    value: schema.type
                }],
            parsedValue: types
        };
    }
    return { parsedValue: types, origins: [] };
};
const parseRequiredKeyword = (schema, location) => {
    if (schema.required) {
        return {
            origins: [{
                    path: location.child('required').path,
                    type: location.schemaOriginType,
                    value: schema.required
                }],
            parsedValue: schema.required
        };
    }
    return {
        origins: [],
        parsedValue: []
    };
};
const generateDefaultMinPropertiesKeyword = () => ({ parsedValue: 0, origins: [] });
const parseCoreSchemaMetaSchema = (schema, location) => {
    const type = parseType(schema, location);
    const additionalProperties = parseWithLocation(schema.additionalProperties, location.child('additionalProperties'));
    const properties = parseSchemaProperties(schema.properties, location.child('properties'));
    const required = parseRequiredKeyword(schema, location);
    const minProperties = generateDefaultMinPropertiesKeyword();
    const parsedSchemaKeywords = {
        additionalProperties,
        minProperties,
        properties,
        required,
        type
    };
    return create_json_set_1.createJsonSet(parsedSchemaKeywords);
};
const parseBooleanSchema = (schema, location) => {
    const schemaOrigins = [{
            path: location.path,
            type: location.schemaOriginType,
            value: schema
        }];
    const allowsAllJsonValues = util_1.isUndefined(schema) ? true : schema;
    return allowsAllJsonValues ? create_json_set_1.createAllJsonSet(schemaOrigins) : create_json_set_1.createEmptyJsonSet(schemaOrigins);
};
const parseWithLocation = (schema, location) => {
    return (util_1.isBoolean(schema) || util_1.isUndefined(schema))
        ? parseBooleanSchema(schema, location)
        : parseCoreSchemaMetaSchema(schema, location);
};
exports.parseAsJsonSet = (schema, originType) => {
    return parseWithLocation(schema, schema_location_1.SchemaLocation.createRoot(originType));
};
