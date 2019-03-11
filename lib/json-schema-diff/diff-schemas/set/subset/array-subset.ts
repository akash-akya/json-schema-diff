// tslint:disable:max-classes-per-file

import {RepresentationJsonSchema, Subset} from '../set';
import {ArraySubsetConfig} from './array-subset/array-subset-config';
import {arraySubsetConfigHasContradictions} from './array-subset/array-subset-config-has-contradictions';
import {complementArraySubsetConfig} from './array-subset/complement-array-subset-config';
import {intersectArraySubsetConfig} from './array-subset/intersect-array-subset-config';
import {simplifyArraySubsetConfig} from './array-subset/simplify-array-subset-config';
import {AllSubset, EmptySubset} from './subset';

class SomeArraySubset implements Subset<'array'> {
    public readonly setType = 'array';
    public readonly type = 'some';

    public constructor(private readonly config: ArraySubsetConfig) {
    }

    public complement(): Array<Subset<'array'>> {
        return complementArraySubsetConfig(this.config).map(createArraySubsetFromConfig);
    }

    public intersect(other: Subset<'array'>): Subset<'array'> {
        return other.intersectWithSome(this);
    }

    public intersectWithSome(other: SomeArraySubset): Subset<'array'> {
        return createArraySubsetFromConfig(intersectArraySubsetConfig(this.config, other.config));
    }

    public toJsonSchema(): RepresentationJsonSchema {
        return {
            items: this.config.items.toJsonSchema(),
            maxItems: this.config.maxItems,
            minItems: this.config.minItems,
            type: ['array']
        };
    }
}

export const allArraySubset = new AllSubset('array');
export const emptyArraySubset = new EmptySubset('array');

export const createArraySubsetFromConfig = (config: ArraySubsetConfig): Subset<'array'> => {
    const simplifiedConfig = simplifyArraySubsetConfig(config);

    return arraySubsetConfigHasContradictions(simplifiedConfig)
        ? emptyArraySubset
        : new SomeArraySubset(simplifiedConfig);
};
