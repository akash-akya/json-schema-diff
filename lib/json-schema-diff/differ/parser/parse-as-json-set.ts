import {CoreSchemaMetaSchema, JsonSchema, JsonSchemaMap, SimpleTypes} from 'json-schema-spec-types';
import {isBoolean, isUndefined} from 'util';
import {
    allSchemaTypes, ParsedMinPropertiesKeyword,
    ParsedPropertiesKeyword, ParsedRequiredKeyword,
    ParsedSchemaKeywords,
    ParsedTypeKeyword,
    SchemaOrigin,
    SchemaOriginType, Set
} from './json-set/set';
import {SchemaLocation} from './schema-location';
import {createAllJsonSet, createEmptyJsonSet, createJsonSet} from './set-factories/create-json-set';

const toSimpleTypeArray = (type?: SimpleTypes | SimpleTypes[]): SimpleTypes[] => {
    if (!type) {
        return allSchemaTypes;
    }

    if (typeof type === 'string') {
        return [type];
    }

    return type;
};

const parseSchemaProperties = (
    schemaProperties: JsonSchemaMap = {}, location: SchemaLocation
): ParsedPropertiesKeyword => {
    const objectSetProperties: ParsedPropertiesKeyword = {};

    for (const propertyName of Object.keys(schemaProperties)) {
        const propertySchema = schemaProperties[propertyName];
        const propertyLocation = location.child(propertyName);
        objectSetProperties[propertyName] = parseWithLocation(propertySchema, propertyLocation);
    }
    return objectSetProperties;
};

const parseType = (schema: CoreSchemaMetaSchema, location: SchemaLocation): ParsedTypeKeyword => {
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

    return {parsedValue: types, origins: []};
};

const parseRequiredKeyword = (schema: CoreSchemaMetaSchema, location: SchemaLocation): ParsedRequiredKeyword => {
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

const generateDefaultMinPropertiesKeyword = (): ParsedMinPropertiesKeyword => ({parsedValue: 0, origins: []});

const parseCoreSchemaMetaSchema = (schema: CoreSchemaMetaSchema, location: SchemaLocation): Set<'json'> => {
    const type = parseType(schema, location);
    const additionalProperties = parseWithLocation(
        schema.additionalProperties, location.child('additionalProperties')
    );
    const properties = parseSchemaProperties(schema.properties, location.child('properties'));
    const required = parseRequiredKeyword(schema, location);
    const minProperties = generateDefaultMinPropertiesKeyword();
    const parsedSchemaKeywords: ParsedSchemaKeywords = {
        additionalProperties,
        minProperties,
        properties,
        required,
        type
    };

    return createJsonSet(parsedSchemaKeywords);
};

const parseBooleanSchema = (schema: boolean | undefined, location: SchemaLocation): Set<'json'> => {
    const schemaOrigins: SchemaOrigin[] = [{
        path: location.path,
        type: location.schemaOriginType,
        value: schema
    }];
    const allowsAllJsonValues = isUndefined(schema) ? true : schema;
    return allowsAllJsonValues ? createAllJsonSet(schemaOrigins) : createEmptyJsonSet(schemaOrigins);
};

const parseWithLocation = (schema: JsonSchema | undefined, location: SchemaLocation): Set<'json'> => {
    return (isBoolean(schema) || isUndefined(schema))
        ? parseBooleanSchema(schema, location)
        : parseCoreSchemaMetaSchema(schema, location);
};

export const parseAsJsonSet = (schema: JsonSchema, originType: SchemaOriginType): Set<'json'> => {
    return parseWithLocation(schema, SchemaLocation.createRoot(originType));
};
