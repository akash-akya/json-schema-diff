import {SimpleTypes} from 'json-schema-spec-types';
import {ObjectSet} from '../set/object-set';
import {ParsedPropertiesKeyword, Set} from '../set/set';
import {
    allObjectSubset,
    createObjectSubsetFromConfig,
    emptyObjectSubset,
    ObjectSubset
} from '../set/subset/object-subset';
import {isTypeSupported} from './is-type-supported';

export interface ObjectSetParsedKeywords {
    additionalProperties: Set<'json'>;
    type: SimpleTypes[];
    properties: ParsedPropertiesKeyword;
    required: string[];
    minProperties: number;
}

const supportsAllObjects = (objectSetParsedKeywords: ObjectSetParsedKeywords): boolean => {
    const everyPropertyIsAll = Object
        .keys(objectSetParsedKeywords.properties)
        .every((propertyName) => objectSetParsedKeywords.properties[propertyName].type === 'all');

    return everyPropertyIsAll
        && objectSetParsedKeywords.required.length === 0
        && objectSetParsedKeywords.additionalProperties.type === 'all';
};

const createObjectSubset = (objectSetParsedKeywords: ObjectSetParsedKeywords): ObjectSubset => {
    if (!isTypeSupported(objectSetParsedKeywords.type, 'object')) {
        return emptyObjectSubset;
    }

    if (supportsAllObjects(objectSetParsedKeywords)) {
        return allObjectSubset;
    }

    return createObjectSubsetFromConfig({
        additionalProperties: objectSetParsedKeywords.additionalProperties,
        minProperties: objectSetParsedKeywords.minProperties,
        properties: objectSetParsedKeywords.properties,
        required: objectSetParsedKeywords.required
    });
};

export const createObjectSet = (objectSetParsedKeywords: ObjectSetParsedKeywords): Set<'object'> => {
    const objectSubset = createObjectSubset(objectSetParsedKeywords);
    return new ObjectSet([objectSubset]);
};
