// tslint:disable:max-classes-per-file

import {SimpleTypes} from 'json-schema-spec-types';
import {DiffJsonSchema} from '../diff-json-schema';
import {
    SchemaOrigin, Set,
    toDestinationOriginValues,
    toSourceOriginValues
} from '../set';

interface TypeSet<T extends SimpleTypes> extends Set<T> {
    intersectWithAll(other: AllTypeSet<T>): TypeSet<T>;
    intersectWithEmpty(other: EmptyTypeSet<T>): TypeSet<T>;
}

export class AllTypeSet<T extends SimpleTypes> implements TypeSet<T> {
    public readonly type = 'all';

    public constructor(public readonly setType: T,
                       public readonly schemaOrigins: SchemaOrigin[]) {
    }

    public toAll(): Set<T> {
        throw new Error('not implemented');
    }

    public toEmpty(): Set<T> {
        throw new Error('not implemented');
    }

    public intersect(otherSet: TypeSet<T>): TypeSet<T> {
        return otherSet.intersectWithAll(this);
    }

    public intersectWithAll(other: TypeSet<T>): TypeSet<T> {
        return new AllTypeSet<T>(this.setType, this.schemaOrigins.concat(other.schemaOrigins));
    }

    public intersectWithEmpty(other: TypeSet<T>): TypeSet<T> {
        return new EmptyTypeSet<T>(this.setType, this.schemaOrigins.concat(other.schemaOrigins));
    }

    public complement(): TypeSet<T> {
        return new EmptyTypeSet(this.setType, this.schemaOrigins);
    }

    public toJsonSchema(): DiffJsonSchema {
        return {
            'type': [this.setType],
            'x-destination-origins': toDestinationOriginValues(this.schemaOrigins),
            'x-source-origins': toSourceOriginValues(this.schemaOrigins)
        };
    }
}

export class EmptyTypeSet<T extends SimpleTypes> implements TypeSet<T> {
    public readonly type = 'empty';

    public constructor(public readonly setType: T,
                       public readonly schemaOrigins: SchemaOrigin[]) {
    }

    public toAll(): Set<T> {
        throw new Error('not implemented');
    }

    public toEmpty(): Set<T> {
        throw new Error('not implemented');
    }

    public intersect(otherSet: TypeSet<T>): TypeSet<T> {
        return otherSet.intersectWithEmpty(this);
    }

    public intersectWithAll(other: TypeSet<T>): TypeSet<T> {
        return new EmptyTypeSet(this.setType, this.schemaOrigins.concat(other.schemaOrigins));
    }

    public intersectWithEmpty(other: TypeSet<T>): TypeSet<T> {
        // TODO: this can't be asserted without keywords support e.g. {allOf: [{type: !str}, {type: !str}]}} -> true
        return new EmptyTypeSet(this.setType, this.schemaOrigins.concat(other.schemaOrigins));
    }

    public complement(): TypeSet<T> {
        return new AllTypeSet(this.setType, this.schemaOrigins);
    }

    public toJsonSchema(): DiffJsonSchema {
        return false;
    }
}
