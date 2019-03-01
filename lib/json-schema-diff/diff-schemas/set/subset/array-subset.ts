// tslint:disable:max-classes-per-file

import {allJsonSet} from '../json-set';
import {defaultMaxItems, defaultMinItems} from '../keyword-defaults';
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
        const complementedItems = this.complementItems();
        const complementedMinItems = this.complementMinItems();
        const complementedMaxItems = this.complementMaxItems();
        return [complementedItems, complementedMinItems, complementedMaxItems];
    }

    public intersect(other: Subset<'array'>): Subset<'array'> {
        return other.intersectWithSome(this);
    }

    public intersectWithSome(other: SomeArraySubset): Subset<'array'> {
        return createArraySubsetFromConfig({
            items: this.config.items.intersect(other.config.items),
            maxItems: this.intersectMaxItems(other),
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
            maxItems: defaultMaxItems,
            minItems: 1
        });
    }

    private complementMinItems(): Subset<'array'> {
        return createArraySubsetFromConfig({
            items: allJsonSet,
            maxItems: this.config.minItems - 1,
            minItems: defaultMinItems
        });
    }

    private complementMaxItems(): Subset<'array'> {
        return createArraySubsetFromConfig({
            items: allJsonSet,
            maxItems: defaultMaxItems,
            minItems: this.config.maxItems + 1
        });
    }

    private intersectMinItems(other: SomeArraySubset): number {
        return Math.max(this.config.minItems, other.config.minItems);
    }

    private intersectMaxItems(other: SomeArraySubset): number {
        return Math.min(this.config.maxItems, other.config.maxItems);
    }
}

const simplifyArraySubsetConfig = (config: SomeArraySubsetConfig): SomeArraySubsetConfig => {
    if (config.maxItems === 0) {
        return {...config, items: allJsonSet};
    } else {
        return config;
    }
};

export const allArraySubset = new AllSubset('array');
export const emptyArraySubset = new EmptySubset('array');

export const createArraySubsetFromConfig = (config: SomeArraySubsetConfig): Subset<'array'> => {
    const simplifiedConfig = simplifyArraySubsetConfig(config);

    return arrayHasContradictions(simplifiedConfig)
        ? emptyArraySubset
        : new SomeArraySubset(simplifiedConfig);
};
