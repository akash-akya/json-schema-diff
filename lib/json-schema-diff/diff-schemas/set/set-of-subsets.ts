import * as _ from 'lodash';
import {RepresentationJsonSchema, Set, Subset} from './set';

export class SetOfSubsets<T> implements Set<T> {
    public constructor(public readonly setType: T, private readonly subsets: Array<Subset<T>>) {
    }

    public get type() {
        if (this.hasAtLeastOneSubsetOfType('all')) {
            return 'all';
        }

        if (this.hasAtLeastOneSubsetOfType('some')) {
            return 'some';
        }

        return 'empty';
    }

    public complement(): Set<T> {
        const newSubsets: Array<Subset<T>> = [];

        for (const subset of this.subsets) {
            newSubsets.push(...subset.complement());
        }

        return new SetOfSubsets(this.setType, newSubsets);
    }

    public intersect(other: SetOfSubsets<T>): Set<T> {
        const newSubsets = [];
        for (const thisSubset of this.subsets) {
            for (const otherSubset of other.subsets) {
                newSubsets.push(thisSubset.intersect(otherSubset));
            }
        }
        return new SetOfSubsets(this.setType, newSubsets);
    }

    public toJsonSchema(): RepresentationJsonSchema {
        const schemas = this.subsets
            .filter((subset) => subset.type !== 'empty')
            .map((subset) => subset.toJsonSchema());

        const dedupedSchemas = _.uniqWith(schemas, _.isEqual);

        return {anyOf: dedupedSchemas};
    }

    private hasAtLeastOneSubsetOfType(setType: 'all' | 'some') {
        return this.subsets.some((subset) => subset.type === setType);
    }
}
