// tslint:disable:max-classes-per-file
import {RepresentationJsonSchema, Set} from './set';
import {EmptyTypeSet} from './type-set';

export interface ArraySet extends Set<'array'> {
    intersect(other: ArraySet): Set<'array'>;
    intersectWithSome(other: SomeArraySet): Set<'array'>;
}

export interface SomeArraySetConfig {
    items: Set<'json'>;
    minItems: number;
}

export class AllArraySet implements ArraySet {
    public readonly setType = 'array';
    public readonly type = 'all';

    public complement(): Set<'array'> {
        return emptyArraySet;
    }

    public intersect(other: ArraySet): Set<'array'> {
        return other;
    }

    public intersectWithSome(other: SomeArraySet): Set<'array'> {
        return other;
    }

    public toJsonSchema(): RepresentationJsonSchema {
        return {type: ['array']};
    }
}

export const allArraySet = new AllArraySet();

export class EmptyArraySet implements ArraySet {
    public readonly setType = 'array';
    public readonly type = 'empty';

    public complement(): Set<'array'> {
        return allArraySet;
    }

    public intersect(): Set<'array'> {
        return this;
    }

    public intersectWithSome(): Set<'array'> {
        return this;
    }

    public toJsonSchema(): RepresentationJsonSchema {
        return false;
    }
}

export const emptyArraySet = new EmptyArraySet();

export class SomeArraySet implements ArraySet {
    public readonly setType = 'array';
    public readonly type = 'some';

    public constructor(private readonly config: SomeArraySetConfig) {
    }

    public complement(): Set<'array'> {
        // TODO: This should complement the minItems keyword, however cannot be tested without minItems support
        return new SomeArraySet({
            items: this.config.items.complement(),
            minItems: 1
        });
    }

    public intersect(other: ArraySet): Set<'array'> {
        return other.intersectWithSome(this);
    }

    public intersectWithSome(other: SomeArraySet): Set<'array'> {
        // TODO: Add support for intersecting minItems, need minItems to test:
        // {type: array, minItems: 1} -> {type: array, minItems: 2}
        // this will lead to us needing maxItem support

        return createArraySetFromConfig({
            items: this.config.items.intersect(other.config.items),
            minItems: this.config.minItems
        });
    }

    public toJsonSchema(): RepresentationJsonSchema {
        return {
            items: this.config.items.toJsonSchema(),
            minItems: this.config.minItems,
            type: ['array']
        };
    }
}

const hasContradictions = (config: SomeArraySetConfig): boolean => {
    return config.items.type === 'empty' && config.minItems > 0;
};

const createArraySetFromConfig = (config: SomeArraySetConfig): Set<'array'> =>
    hasContradictions(config)
        // TODO: Make this be the emptyArraySet, can't be tested, needs minItems support:
        //  {type: array, items: false, minItems: 1} -> {type: array, items: false}
        ? new EmptyTypeSet('array')
        : new SomeArraySet(config);
