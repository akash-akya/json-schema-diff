import {SimpleTypes} from 'json-schema-spec-types';
import {allArraySet, emptyArraySet, SomeArraySet} from '../set/array-set';
import {Set} from '../set/set';
import {isTypeSupported} from './is-type-supported';

export interface ArraySetParsedKeywords {
    items: Set<'json'>;
    minItems: number;
    type: SimpleTypes[];
}

const supportsAllArrays = (arraySetParsedKeywords: ArraySetParsedKeywords): boolean => {
    // TODO: This should look at the minItems keyword, but we need minItems support to do that
    return arraySetParsedKeywords.items.type === 'all';
};

export const createArraySet = (arraySetParsedKeywords: ArraySetParsedKeywords): Set<'array'> => {
    if (!isTypeSupported(arraySetParsedKeywords.type, 'array')) {
        return emptyArraySet;
    }

    if (supportsAllArrays(arraySetParsedKeywords)) {
        return allArraySet;
    }

    // TODO: Make this invoke createArraySetFromConfig, but can't be asserted, needs support:
    //  {minItems: 1, type: 'array', items: false} -> false
    return new SomeArraySet(arraySetParsedKeywords);
};
