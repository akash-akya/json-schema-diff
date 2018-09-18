import {AllJsonSet, EmptyJsonSet, SomeJsonSet, TypeSets} from '../json-set/json-set';
import {ParsedSchemaKeywords, SchemaOrigin, Set} from '../json-set/set';
import {createObjectSet} from './create-object-set';
import {createTypeSet} from './create-type-set';

export const createJsonSet = (parsedSchemaKeywords: ParsedSchemaKeywords): Set<'json'> => {
    const typeSets: TypeSets = {
        array: createTypeSet('array', parsedSchemaKeywords),
        boolean: createTypeSet('boolean', parsedSchemaKeywords),
        integer: createTypeSet('integer', parsedSchemaKeywords),
        null: createTypeSet('null', parsedSchemaKeywords),
        number: createTypeSet('number', parsedSchemaKeywords),
        object: createObjectSet(parsedSchemaKeywords),
        string: createTypeSet('string', parsedSchemaKeywords)
    };

    return new SomeJsonSet(typeSets);
};

export const createAllJsonSet = (schemaOrigins: SchemaOrigin[]): Set<'json'> => {
    return new AllJsonSet(schemaOrigins);
};

export const createEmptyJsonSet = (schemaOrigins: SchemaOrigin[]): Set<'json'> => {
    return new EmptyJsonSet(schemaOrigins);
};
