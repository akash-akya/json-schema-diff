// tslint:disable:max-classes-per-file

import {allJsonSet} from '../json-set';
import {RepresentationJsonSchema, Set, Subset} from '../set';
import {arrayHasContradictions} from './array-subset/array-has-contradictions';
import {AllSubset, EmptySubset} from './subset';

export interface SomeArraySubsetConfig {
    items: Set<'json'>;
    maxItems: number;
    minItems: number;
}

class SomeArraySubset implements Subset<'array'> {
    public readonly setType = 'array';
    public readonly type = 'some';

    public constructor(private readonly config: SomeArraySubsetConfig) {
    }

    public complement(): Array<Subset<'array'>> {
        // TODO: This should complement the maxItems keyword, however cannot be tested without maxItems support
        const complementedItems = this.complementItems();
        const complementedMinItems = this.complementMinItems();
        return [complementedItems, complementedMinItems];
    }

    public intersect(other: Subset<'array'>): Subset<'array'> {
        return other.intersectWithSome(this);
    }

    public intersectWithSome(other: SomeArraySubset): Subset<'array'> {
        return createArraySubsetFromConfig({
            items: this.config.items.intersect(other.config.items),
            maxItems: this.config.maxItems,
            minItems: this.intersectMinItems(other)
        });
    }

    public toJsonSchema(): RepresentationJsonSchema {
        return {
            items: this.config.items.toJsonSchema(),
            maxItems: this.config.maxItems,
            minItems: this.config.minItems,
            type: ['array']
        };
    }

    private complementItems(): Subset<'array'> {
        return createArraySubsetFromConfig({
            items: this.config.items.complement(),
            maxItems: Infinity,
            minItems: 1
        });
    }

    private complementMinItems(): Subset<'array'> {
        return createArraySubsetFromConfig({
            items: allJsonSet,
            maxItems: this.config.minItems - 1,
            minItems: 0
        });
    }

    private intersectMinItems(other: SomeArraySubset): number {
        return Math.max(this.config.minItems, other.config.minItems);
    }
}

const simplifyArraySubsetConfig = (config: SomeArraySubsetConfig): SomeArraySubsetConfig =>
    config.maxItems === 0 ? {...config, items: allJsonSet} : config;

export const allArraySubset = new AllSubset('array');
export const emptyArraySubset = new EmptySubset('array');

export const createArraySubsetFromConfig = (config: SomeArraySubsetConfig): Subset<'array'> => {
    const simplifiedConfig = simplifyArraySubsetConfig(config);

    return arrayHasContradictions(simplifiedConfig)
        ? emptyArraySubset
        : new SomeArraySubset(simplifiedConfig);
};
