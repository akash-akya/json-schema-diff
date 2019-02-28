import {SimpleTypes} from 'json-schema-spec-types';
import {allJsonSet, emptyJsonSet, SomeJsonSet, TypeSets} from '../set/json-set';
import {ParsedPropertiesKeyword, Set} from '../set/set';
import {createArraySet} from './create-array-set';
import {createObjectSet} from './create-object-set';
import {createTypeSet} from './create-type-set';

export interface ParsedSchemaKeywords {
    additionalProperties: Set<'json'>;
    items: Set<'json'>;
    maxItems: number;
    minItems: number;
    minProperties: number;
    properties: ParsedPropertiesKeyword;
    required: string[];
    type: SimpleTypes[];
}

export const createSomeJsonSet = (parsedSchemaKeywords: ParsedSchemaKeywords): Set<'json'> => {
    const typeSets: TypeSets = {
        array: createArraySet(parsedSchemaKeywords),
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
