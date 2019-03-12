import {SimpleTypes} from 'json-schema-spec-types';
import {ParsedPropertiesKeyword, Set, Subset} from '../set/set';
import {SetOfSubsets} from '../set/set-of-subsets';
import {allObjectSubset, createObjectSubsetFromConfig, emptyObjectSubset} from '../set/subset/object-subset';
import {isTypeSupported} from './is-type-supported';

export interface ObjectSetParsedKeywords {
    additionalProperties: Set<'json'>;
    maxProperties: number;
    minProperties: number;
    properties: ParsedPropertiesKeyword;
    required: string[];
    type: SimpleTypes[];
}

const supportsAllObjects = (objectSetParsedKeywords: ObjectSetParsedKeywords): boolean => {
    const everyPropertyIsAll = Object.keys(objectSetParsedKeywords.properties)
        .every((propertyName) => objectSetParsedKeywords.properties[propertyName].type === 'all');

    return everyPropertyIsAll
        && objectSetParsedKeywords.required.length === 0
        && objectSetParsedKeywords.additionalProperties.type === 'all'
        && objectSetParsedKeywords.minProperties === 0;
};

const createObjectSubset = (objectSetParsedKeywords: ObjectSetParsedKeywords): Subset<'object'> => {
    if (!isTypeSupported(objectSetParsedKeywords.type, 'object')) {
        return emptyObjectSubset;
    }

    if (supportsAllObjects(objectSetParsedKeywords)) {
        return allObjectSubset;
    }

    return createObjectSubsetFromConfig({
        additionalProperties: objectSetParsedKeywords.additionalProperties,
        maxProperties: objectSetParsedKeywords.maxProperties,
        minProperties: objectSetParsedKeywords.minProperties,
        properties: objectSetParsedKeywords.properties,
        required: objectSetParsedKeywords.required
    });
};

export const createObjectSet = (objectSetParsedKeywords: ObjectSetParsedKeywords): Set<'object'> => {
    const objectSubset = createObjectSubset(objectSetParsedKeywords);
    return new SetOfSubsets('object', [objectSubset]);
};
