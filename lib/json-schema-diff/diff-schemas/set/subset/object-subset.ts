import {RepresentationJsonSchema, SchemaProperties, Subset} from '../set';
import {complementObjectSubsetConfig} from './object-subset/complement-object-subset-config';
import {intersectObjectSubsetConfig} from './object-subset/intersect-object-subset-config';
import {getPropertyNames, getPropertySet, ObjectSubsetConfig} from './object-subset/object-subset-config';
import {objectSubsetConfigHasContradictions} from './object-subset/object-subset-config-has-contradictions';
import {AllSubset, EmptySubset} from './subset';

class SomeObjectSubset implements Subset<'object'> {
    public readonly setType = 'object';
    public readonly type = 'some';

    public constructor(private readonly config: ObjectSubsetConfig) {
    }

    public get properties() {
        return this.config.properties;
    }

    public complement(): Array<Subset<'object'>> {
        return complementObjectSubsetConfig(this.config).map(createObjectSubsetFromConfig);
    }

    public intersect(other: Subset<'object'>): Subset<'object'> {
        return other.intersectWithSome(this);
    }

    public intersectWithSome(other: SomeObjectSubset): Subset<'object'> {
        return createObjectSubsetFromConfig(intersectObjectSubsetConfig(this.config, other.config));
    }

    public toJsonSchema(): RepresentationJsonSchema {
        const properties = this.toJsonSchemaMap();
        const additionalProperties = this.config.additionalProperties.toJsonSchema();
        return {
            additionalProperties,
            maxProperties: this.config.maxProperties,
            minProperties: this.config.minProperties,
            properties,
            required: this.config.required,
            type: ['object']
        };
    }

    private toJsonSchemaMap(): SchemaProperties {
        return getPropertyNames(this.config).reduce<SchemaProperties>((acc, propertyName) => {
            acc[propertyName] = getPropertySet(this.config, propertyName).toJsonSchema();
            return acc;
        }, {});
    }
}

export const allObjectSubset = new AllSubset('object');
export const emptyObjectSubset = new EmptySubset('object');
export const createObjectSubsetFromConfig = (config: ObjectSubsetConfig): Subset<'object'> => {
    return objectSubsetConfigHasContradictions(config)
        ? emptyObjectSubset
        : new SomeObjectSubset(config);
};
