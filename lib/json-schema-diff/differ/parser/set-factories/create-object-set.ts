import {ObjectSet} from '../json-set/json-subset/object-set';
import {
    AllObjectSubset,
    EmptyObjectSubset, ObjectSubset,
    SomeObjectSubset
} from '../json-set/json-subset/object-subset';
import {ParsedSchemaKeywords, Set} from '../json-set/set';
import {isTypeSupported} from './is-type-supported';

const supportsAllObjects = (parsedSchemaKeywords: ParsedSchemaKeywords): boolean => {
    const everyPropertyIsAll = Object
        .keys(parsedSchemaKeywords.properties)
        .every((propertyName) => parsedSchemaKeywords.properties[propertyName].type === 'all');

    return everyPropertyIsAll
        && parsedSchemaKeywords.required.parsedValue.length === 0
        && parsedSchemaKeywords.additionalProperties.type === 'all';
};

const createObjectSubset = (parsedSchemaKeywords: ParsedSchemaKeywords): ObjectSubset => {
    if (!isTypeSupported(parsedSchemaKeywords.type, 'object')) {
        return new EmptyObjectSubset(
            parsedSchemaKeywords.type.origins, {}, parsedSchemaKeywords.additionalProperties
        );
    }

    const mergedOrigins = parsedSchemaKeywords.type.origins.concat(parsedSchemaKeywords.required.origins);

    if (supportsAllObjects(parsedSchemaKeywords)) {
        return new AllObjectSubset(
            mergedOrigins,
            {},
            parsedSchemaKeywords.additionalProperties
        );
    }

    return new SomeObjectSubset({
        additionalProperties: parsedSchemaKeywords.additionalProperties,
        minProperties: parsedSchemaKeywords.minProperties,
        properties: parsedSchemaKeywords.properties,
        required: parsedSchemaKeywords.required,
        schemaOrigins: mergedOrigins
    });
};

export const createObjectSet = (parsedSchemaKeywords: ParsedSchemaKeywords): Set<'object'> => {
    const objectSubset = createObjectSubset(parsedSchemaKeywords);
    return new ObjectSet([objectSubset]);
};

export const allObjectSetFromJsonSet = (jsonSet: Set<'json'>) => {
    return new ObjectSet([new AllObjectSubset(jsonSet.schemaOrigins, {}, jsonSet)]);
};
