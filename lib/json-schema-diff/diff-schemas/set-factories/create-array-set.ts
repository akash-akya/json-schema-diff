import {SimpleTypes} from 'json-schema-spec-types';
import {defaultMaxItems, defaultMinItems} from '../set/keyword-defaults';
import {Set, Subset} from '../set/set';
import {SetOfSubsets} from '../set/set-of-subsets';
import {allArraySubset, createArraySubsetFromConfig, emptyArraySubset} from '../set/subset/array-subset';
import {isTypeSupported} from './is-type-supported';

export interface ArraySetParsedKeywords {
    items: Set<'json'>;
    maxItems: number;
    minItems: number;
    type: SimpleTypes[];
}

const supportsAllArrays = (arraySetParsedKeywords: ArraySetParsedKeywords): boolean =>
    arraySetParsedKeywords.items.type === 'all'
    && arraySetParsedKeywords.minItems === defaultMinItems
    && arraySetParsedKeywords.maxItems === defaultMaxItems;

const createArraySubset = (arraySetParsedKeywords: ArraySetParsedKeywords): Subset<'array'> => {
    if (!isTypeSupported(arraySetParsedKeywords.type, 'array')) {
        return emptyArraySubset;
    }

    if (supportsAllArrays(arraySetParsedKeywords)) {
        return allArraySubset;
    }

    return createArraySubsetFromConfig(arraySetParsedKeywords);
};

export const createArraySet = (arraySetParsedKeywords: ArraySetParsedKeywords): Set<'array'> => {
    const arraySubset = createArraySubset(arraySetParsedKeywords);
    return new SetOfSubsets('array', [arraySubset]);
};
