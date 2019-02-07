// tslint:disable:max-classes-per-file

import {SimpleTypes} from 'json-schema-spec-types';
import {DiffJsonSchema} from '../diff-json-schema';
import {Set} from '../set';

interface TypeSet<T extends SimpleTypes> extends Set<T> {}

export class AllTypeSet<T extends SimpleTypes> implements TypeSet<T> {
    public readonly type = 'all';

    public constructor(public readonly setType: T) {
    }

    public intersect(otherSet: TypeSet<T>): TypeSet<T> {
        return otherSet;
    }

    public complement(): TypeSet<T> {
        return new EmptyTypeSet(this.setType);
    }

    public toJsonSchema(): DiffJsonSchema {
        return {type: [this.setType]};
    }
}

export class EmptyTypeSet<T extends SimpleTypes> implements TypeSet<T> {
    public readonly type = 'empty';

    public constructor(public readonly setType: T) {
    }

    public intersect(): TypeSet<T> {
        return this;
    }

    public complement(): TypeSet<T> {
        return new AllTypeSet(this.setType);
    }

    public toJsonSchema(): DiffJsonSchema {
        return false;
    }
}
