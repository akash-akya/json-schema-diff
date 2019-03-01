// tslint:disable:max-classes-per-file

import {SimpleTypes} from 'json-schema-spec-types';
import {RepresentationJsonSchema, Subset} from '../set';

export class AllSubset<T extends SimpleTypes> implements Subset<T> {
    public readonly type = 'all';

    public constructor(public readonly setType: T) {
    }

    public complement(): Array<Subset<T>> {
        return [new EmptySubset(this.setType)];
    }

    public intersect(other: Subset<T>): Subset<T> {
        return other;
    }

    public intersectWithSome(other: Subset<T>): Subset<T> {
        return other;
    }

    public toJsonSchema(): RepresentationJsonSchema {
        return {type: [this.setType]};
    }
}

export class EmptySubset<T extends SimpleTypes> implements Subset<T> {
    public readonly type = 'empty';

    public constructor(public readonly setType: T) {
    }

    public complement(): Array<Subset<T>> {
        return [new AllSubset(this.setType)];
    }

    public intersect(): Subset<T> {
        return this;
    }

    public intersectWithSome(): Subset<T> {
        return this;
    }

    public toJsonSchema(): RepresentationJsonSchema {
        return false;
    }
}
