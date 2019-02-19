import {SimpleTypes} from 'json-schema-spec-types';
import {Set} from '../set/set';
import {AllTypeSet, EmptyTypeSet} from '../set/type-set';
import {isTypeSupported} from './is-type-supported';

export const createTypeSet = <T extends SimpleTypes>(setType: T, types: SimpleTypes[]): Set<T> =>
    isTypeSupported(types, setType)
        ? new AllTypeSet(setType)
        : new EmptyTypeSet(setType);
