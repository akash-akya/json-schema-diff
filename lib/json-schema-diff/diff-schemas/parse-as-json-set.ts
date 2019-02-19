import {CoreSchemaMetaSchema, JsonSchema, JsonSchemaMap, SimpleTypes} from 'json-schema-spec-types';
import {isBoolean, isUndefined} from 'util';
import {createAllJsonSet, createEmptyJsonSet, createSomeJsonSet} from './set-factories/create-json-set';
import {allSchemaTypes, ParsedPropertiesKeyword, Set} from './set/set';

const parseSchemaProperties = (schemaProperties: JsonSchemaMap = {}): ParsedPropertiesKeyword => {
    const objectSetProperties: ParsedPropertiesKeyword = {};

    for (const propertyName of Object.keys(schemaProperties)) {
        const propertySchema = schemaProperties[propertyName];
        objectSetProperties[propertyName] = parseSchemaOrUndefinedAsJsonSet(propertySchema);
    }
    return objectSetProperties;
};

const parseType = (type: SimpleTypes | SimpleTypes[] | undefined): SimpleTypes[] => {
    if (!type) {
        return allSchemaTypes;
    }

    if (typeof type === 'string') {
        return [type];
    }

    return type;
};

const parseRequiredKeyword = (schema: CoreSchemaMetaSchema): string[] => schema.required || [];

const generateDefaultMinPropertiesKeyword = (): number => 0;

const generateDefaultMinItemsKeyword = (): number => 0;

const parseCoreSchemaMetaSchema = (schema: CoreSchemaMetaSchema): Set<'json'> =>
    createSomeJsonSet({
        additionalProperties: parseSchemaOrUndefinedAsJsonSet(schema.additionalProperties),
        items: parseSchemaOrUndefinedAsJsonSet(schema.items),
        minItems: generateDefaultMinItemsKeyword(),
        minProperties: generateDefaultMinPropertiesKeyword(),
        properties: parseSchemaProperties(schema.properties),
        required: parseRequiredKeyword(schema),
        type: parseType(schema.type)
    });

const parseBooleanSchema = (schema: boolean | undefined): Set<'json'> => {
    const allowsAllJsonValues = isUndefined(schema) ? true : schema;
    return allowsAllJsonValues ? createAllJsonSet() : createEmptyJsonSet();
};

const parseSchemaOrUndefinedAsJsonSet = (schema: JsonSchema | undefined): Set<'json'> => {
    return (isBoolean(schema) || isUndefined(schema))
        ? parseBooleanSchema(schema)
        : parseCoreSchemaMetaSchema(schema);
};

export const parseAsJsonSet = (schema: JsonSchema): Set<'json'> => {
    return parseSchemaOrUndefinedAsJsonSet(schema);
};
