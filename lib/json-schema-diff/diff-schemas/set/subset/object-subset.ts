// tslint:disable:max-classes-per-file

import {allJsonSet, emptyJsonSet} from '../json-set';
import {ParsedPropertiesKeyword, RepresentationJsonSchema, SchemaProperties, Set, Subset} from '../set';
import {objectHasContradictions} from './object-subset/object-has-contradictions';
import {unique} from './object-subset/unique';
import {AllSubset, EmptySubset} from './subset';

export interface SomeObjectSubsetConfig {
    properties: ParsedPropertiesKeyword;
    additionalProperties: Set<'json'>;
    minProperties: number;
    required: string[];
}

class SomeObjectSubset implements Subset<'object'> {
    public readonly setType = 'object';
    public readonly type = 'some';

    public constructor(private readonly config: SomeObjectSubsetConfig) {
    }

    public get properties() {
        return this.config.properties;
    }

    public complement(): Array<Subset<'object'>> {
        const complementedProperties = this.complementProperties();
        const complementedAdditionalProperties = this.complementAdditionalProperties();
        const complementedRequiredProperties = this.complementRequiredProperties();
        return [...complementedAdditionalProperties, ...complementedProperties, ...complementedRequiredProperties];
    }

    public intersect(other: Subset<'object'>): Subset<'object'> {
        return other.intersectWithSome(this);
    }

    public intersectWithSome(other: SomeObjectSubset): Subset<'object'> {
        return createObjectSubsetFromConfig({
            additionalProperties: this.config.additionalProperties.intersect(other.config.additionalProperties),
            minProperties: this.intersectMinProperties(other),
            properties: this.intersectProperties(other),
            required: this.intersectRequired(other)
        });
    }

    public toJsonSchema(): RepresentationJsonSchema {
        const properties = this.toJsonSchemaMap();
        const additionalProperties = this.config.additionalProperties.toJsonSchema();
        return {
            additionalProperties,
            minProperties: this.config.minProperties,
            properties,
            required: this.config.required,
            type: ['object']
        };
    }

    private getPropertySet(propertyName: string): Set<'json'> {
        return this.config.properties[propertyName] || this.config.additionalProperties;
    }

    private getPropertyNames(): string[] {
        return Object.keys(this.config.properties);
    }

    private toJsonSchemaMap(): SchemaProperties {
        return this.getPropertyNames().reduce<SchemaProperties>((acc, propertyName) => {
            acc[propertyName] = this.getPropertySet(propertyName).toJsonSchema();
            return acc;
        }, {});
    }

    private complementProperties(): Array<Subset<'object'>> {
        return this.getPropertyNames().map((propertyName) => {
            const complementedPropertySchema = this.getPropertySet(propertyName).complement();

            return createObjectSubsetFromConfig({
                    additionalProperties: allJsonSet,
                    // TODO: Untestable today, need:
                    //  not: {properties: {name: {type: 'string'}, minProperties: 1, type: 'object'} -> true
                    minProperties: 0,
                    properties: {[propertyName]: complementedPropertySchema},
                    required: [propertyName]
                }
            );
        });
    }

    private complementRequiredProperties(): Array<Subset<'object'>> {
        return this.config.required.map((requiredPropertyName) =>
            createObjectSubsetFromConfig({
                additionalProperties: allJsonSet,
                minProperties: 0,
                properties: {
                    [requiredPropertyName]: emptyJsonSet
                },
                required: []
            }));
    }

    private complementAdditionalProperties(): Array<Subset<'object'>> {
        const defaultComplementedAdditionalProperties = [this.complementAdditionalPropertiesWithEmpty()];

        return this.getPropertyNames().length > 0
            ? defaultComplementedAdditionalProperties.concat(this.complementAdditionalPropertiesWithRequired())
            : defaultComplementedAdditionalProperties;
    }

    private complementAdditionalPropertiesWithEmpty(): Subset<'object'> {
        const propertyNames = this.getPropertyNames();

        const emptyProperties = propertyNames
            .reduce<ParsedPropertiesKeyword>((acc, propertyName) => {
                acc[propertyName] = emptyJsonSet;
                return acc;
            }, {});

        return createObjectSubsetFromConfig({
            additionalProperties: this.config.additionalProperties.complement(),
            minProperties: 1,
            properties: emptyProperties,
            required: []
        });
    }

    private complementAdditionalPropertiesWithRequired(): Subset<'object'> {
        return createObjectSubsetFromConfig({
            additionalProperties: this.config.additionalProperties.complement(),
            minProperties: 1 + Object.keys(this.config.properties).length,
            // TODO: All the tests went green when I made this an empty object, whats up with that?
            properties: this.config.properties,
            required: Object.keys(this.config.properties)
        });
    }

    private intersectMinProperties(other: SomeObjectSubset): number {
        // TODO: can't be asserted without minProperties support:
        //  {minProperties: 1, type: 'object'} -> {minProperties: 2, type: 'object'}
        return Math.max(this.config.minProperties, other.config.minProperties);
    }

    private intersectProperties(other: SomeObjectSubset): ParsedPropertiesKeyword {
        const allPropertyNames = unique(this.getPropertyNames(), other.getPropertyNames());

        return allPropertyNames.reduce<ParsedPropertiesKeyword>((accumulator, propertyName) => {
            accumulator[propertyName] = this.getPropertySet(propertyName).intersect(other.getPropertySet(propertyName));

            return accumulator;
        }, {});
    }

    private intersectRequired(other: SomeObjectSubset): string[] {
        return unique(this.config.required, other.config.required);
    }
}

export const allObjectSubset = new AllSubset('object');
export const emptyObjectSubset = new EmptySubset('object');
export const createObjectSubsetFromConfig = (config: SomeObjectSubsetConfig): Subset<'object'> => {
    return objectHasContradictions(config)
        ? emptyObjectSubset
        : new SomeObjectSubset(config);
};
