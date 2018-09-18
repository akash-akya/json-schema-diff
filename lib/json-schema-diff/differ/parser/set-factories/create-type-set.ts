import {SimpleTypes} from 'json-schema-spec-types';
import {AllTypeSet, EmptyTypeSet} from '../json-set/json-subset/type-set';
import {ParsedSchemaKeywords, Set} from '../json-set/set';
import {isTypeSupported} from './is-type-supported';

export const createTypeSet = <T extends SimpleTypes>(setType: T, parsedSchemaKeywords: ParsedSchemaKeywords): Set<T> =>
    isTypeSupported(parsedSchemaKeywords.type, setType)
        ? new AllTypeSet(setType, parsedSchemaKeywords.type.origins)
        : new EmptyTypeSet(setType, parsedSchemaKeywords.type.origins);

export const allTypeSetFromJsonSet = <T extends SimpleTypes>(setType: T, jsonSet: Set<'json'>) => {
    return new AllTypeSet(setType, jsonSet.schemaOrigins);
};
