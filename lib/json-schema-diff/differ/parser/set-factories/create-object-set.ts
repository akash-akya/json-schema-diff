import {ObjectSet} from '../json-set/json-subset/object-set';
import {
    allObjectSubset, createObjectSubsetFromConfig,
    emptyObjectSubset,
    ObjectSubset
} from '../json-set/json-subset/object-subset';
import {ParsedSchemaKeywords, Set} from '../json-set/set';
import {isTypeSupported} from './is-type-supported';

const supportsAllObjects = (parsedSchemaKeywords: ParsedSchemaKeywords): boolean => {
    const everyPropertyIsAll = Object
        .keys(parsedSchemaKeywords.properties)
        .every((propertyName) => parsedSchemaKeywords.properties[propertyName].type === 'all');

    return everyPropertyIsAll
        && parsedSchemaKeywords.required.length === 0
        && parsedSchemaKeywords.additionalProperties.type === 'all';
};

const createObjectSubset = (parsedSchemaKeywords: ParsedSchemaKeywords): ObjectSubset => {
    if (!isTypeSupported(parsedSchemaKeywords.type, 'object')) {
        return emptyObjectSubset;
    }

    if (supportsAllObjects(parsedSchemaKeywords)) {
        return allObjectSubset;
    }

    return createObjectSubsetFromConfig({
        additionalProperties: parsedSchemaKeywords.additionalProperties,
        minProperties: parsedSchemaKeywords.minProperties,
        properties: parsedSchemaKeywords.properties,
        required: parsedSchemaKeywords.required
    });
};

export const createObjectSet = (parsedSchemaKeywords: ParsedSchemaKeywords): Set<'object'> => {
    const objectSubset = createObjectSubset(parsedSchemaKeywords);
    return new ObjectSet([objectSubset]);
};
