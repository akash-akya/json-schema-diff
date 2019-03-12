import {CoreSchemaMetaSchema, JsonSchema, JsonSchemaMap, SimpleTypes} from 'json-schema-spec-types';
import {createAllJsonSet, createEmptyJsonSet, createSomeJsonSet} from './set-factories/create-json-set';
import {
    defaultMaxItems,
    defaultMaxProperties,
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

const parseNumericKeyword = (keywordValue: number | undefined, defaultValue: number): number =>
    typeof keywordValue === 'number' ? keywordValue : defaultValue;

const parseCoreSchemaMetaSchema = (schema: CoreSchemaMetaSchema): Set<'json'> =>
    createSomeJsonSet({
        additionalProperties: parseSchemaOrUndefinedAsJsonSet(schema.additionalProperties),
        items: parseSchemaOrUndefinedAsJsonSet(schema.items),
        maxItems: parseNumericKeyword(schema.maxItems, defaultMaxItems),
        maxProperties: defaultMaxProperties,
        minItems: parseNumericKeyword(schema.minItems, defaultMinItems),
        minProperties: parseNumericKeyword(schema.minProperties, defaultMinProperties),
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
