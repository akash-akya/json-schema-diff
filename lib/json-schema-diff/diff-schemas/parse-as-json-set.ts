import {CoreSchemaMetaSchema, JsonSchema, JsonSchemaMap, SimpleTypes} from 'json-schema-spec-types';
import {createAllJsonSet, createEmptyJsonSet, createSomeJsonSet} from './set-factories/create-json-set';
import {
    defaultMaxItems,
    defaultMinItems,
    defaultMinProperties,
    defaultRequired,
    defaultTypes
} from './set/keyword-defaults';
import {ParsedPropertiesKeyword, Set} from './set/set';

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
        return defaultTypes;
    }

    if (typeof type === 'string') {
        return [type];
    }

    return type;
};

const parseRequiredKeyword = (required: string[] | undefined): string[] => required || defaultRequired;

const parseMinItemsKeyword = (minItems: number | undefined): number =>
    typeof minItems === 'number' ? minItems : defaultMinItems;

const parseMaxItemsKeyword = (maxItems: number | undefined): number =>
    typeof maxItems === 'number' ? maxItems : defaultMaxItems;

const parseCoreSchemaMetaSchema = (schema: CoreSchemaMetaSchema): Set<'json'> =>
    createSomeJsonSet({
        additionalProperties: parseSchemaOrUndefinedAsJsonSet(schema.additionalProperties),
        items: parseSchemaOrUndefinedAsJsonSet(schema.items),
        maxItems: parseMaxItemsKeyword(schema.maxItems),
        minItems: parseMinItemsKeyword(schema.minItems),
        minProperties: defaultMinProperties,
        properties: parseSchemaProperties(schema.properties),
        required: parseRequiredKeyword(schema.required),
        type: parseType(schema.type)
    });

const parseBooleanSchema = (schema: boolean | undefined): Set<'json'> => {
    const allowsAllJsonValues = schema === undefined ? true : schema;
    return allowsAllJsonValues ? createAllJsonSet() : createEmptyJsonSet();
};

const parseSchemaOrUndefinedAsJsonSet = (schema: JsonSchema | undefined): Set<'json'> => {
    return (typeof schema === 'boolean' || schema === undefined)
        ? parseBooleanSchema(schema)
        : parseCoreSchemaMetaSchema(schema);
};

export const parseAsJsonSet = (schema: JsonSchema): Set<'json'> => {
    return parseSchemaOrUndefinedAsJsonSet(schema);
};
