import {SimpleTypes} from 'json-schema-spec-types';
import {allJsonSet, emptyJsonSet, SomeJsonSet, TypeSets} from '../set/json-set';
import {ParsedPropertiesKeyword, Set} from '../set/set';
import {createObjectSet} from './create-object-set';
import {createTypeSet} from './create-type-set';

export interface ParsedSchemaKeywords {
    additionalProperties: Set<'json'>;
    type: SimpleTypes[];
    properties: ParsedPropertiesKeyword;
    required: string[];
    minProperties: number;
}

export const createSomeJsonSet = (parsedSchemaKeywords: ParsedSchemaKeywords): Set<'json'> => {
    const typeSets: TypeSets = {
        array: createTypeSet('array', parsedSchemaKeywords.type),
        boolean: createTypeSet('boolean', parsedSchemaKeywords.type),
        integer: createTypeSet('integer', parsedSchemaKeywords.type),
        null: createTypeSet('null', parsedSchemaKeywords.type),
        number: createTypeSet('number', parsedSchemaKeywords.type),
        object: createObjectSet(parsedSchemaKeywords),
        string: createTypeSet('string', parsedSchemaKeywords.type)
    };

    return new SomeJsonSet(typeSets);
};

export const createAllJsonSet = (): Set<'json'> => {
    return allJsonSet;
};

export const createEmptyJsonSet = (): Set<'json'> => {
    return emptyJsonSet;
};
