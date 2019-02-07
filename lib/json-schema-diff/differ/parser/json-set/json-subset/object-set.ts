import * as _ from 'lodash';
import {DiffJsonSchema} from '../diff-json-schema';
import {Set} from '../set';
import {ObjectSubset} from './object-subset';

export class ObjectSet implements Set<'object'> {
    public readonly setType: 'object';

    public constructor(private readonly objectSubsets: ObjectSubset[]) {
    }

    public get type() {
        if (this.hasAtLeastOneObjectSubsetOfType('all')) {
            return 'all';
        }

        if (this.hasAtLeastOneObjectSubsetOfType('some')) {
            return 'some';
        }

        return 'empty';
    }

    public complement(): Set<'object'> {
        const newObjectSubsets: ObjectSubset[] = [];

        for (const objectSubset of this.objectSubsets) {
            newObjectSubsets.push(...objectSubset.complement());
        }

        return new ObjectSet(newObjectSubsets);
    }

    public intersect(otherSet: ObjectSet): Set<'object'> {
        const newObjectSubsets = [];
        for (const thisObjectSubset of this.objectSubsets) {
            for (const otherObjectSubset of otherSet.objectSubsets) {
                newObjectSubsets.push(thisObjectSubset.intersect(otherObjectSubset));
            }
        }
        return new ObjectSet(newObjectSubsets);
    }

    public toJsonSchema(): DiffJsonSchema {
        const schemas = this.objectSubsets
            .filter((objectSubset) => objectSubset.type !== 'empty')
            .map((objectSubset) => objectSubset.toJsonSchema());

        const dedupedSchemas = _.uniqWith(schemas, _.isEqual);

        return {anyOf: dedupedSchemas};
    }

    private hasAtLeastOneObjectSubsetOfType(setType: 'all' | 'some') {
        return this.objectSubsets.some((objectSubset) => objectSubset.type === setType);
    }
}
