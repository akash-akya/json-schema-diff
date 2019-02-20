// tslint:disable:max-classes-per-file

import * as _ from 'lodash';
import {allJsonSet, emptyJsonSet} from '../json-set';
import {ParsedPropertiesKeyword, RepresentationJsonSchema, SchemaProperties, Set} from '../set';
import {hasContradictions} from './object-subset/has-contradictions';

export interface ObjectSubset {
    type: 'all' | 'empty' | 'some';

    toJsonSchema(): RepresentationJsonSchema;

    intersect(otherSet: ObjectSubset): ObjectSubset;

    complement(): ObjectSubset[];

    intersectWithSome(other: SomeObjectSubset): ObjectSubset;
}

export class AllObjectSubset implements ObjectSubset {
    public readonly type = 'all';

    public intersect(other: ObjectSubset): ObjectSubset {
        return other;
    }

    public intersectWithSome(other: SomeObjectSubset): ObjectSubset {
        return other;
    }

    public complement(): ObjectSubset[] {
        return [emptyObjectSubset];
    }

    public toJsonSchema(): RepresentationJsonSchema {
        return {type: ['object']};
    }
}

export const allObjectSubset = new AllObjectSubset();

export class EmptyObjectSubset implements ObjectSubset {
    public readonly type = 'empty';

    public intersect(): ObjectSubset {
        return this;
    }

    public intersectWithSome(): ObjectSubset {
        return this;
    }

    public complement(): ObjectSubset[] {
        return [allObjectSubset];
    }

    public toJsonSchema(): RepresentationJsonSchema {
        return false;
    }
}

export const emptyObjectSubset = new EmptyObjectSubset();

export interface SomeObjectSubsetConfig {
    properties: ParsedPropertiesKeyword;
    additionalProperties: Set<'json'>;
    minProperties: number;
    required: string[];
}

export class SomeObjectSubset implements ObjectSubset {
    private static intersectRequired(thisRequired: string[], otherRequired: string[]): string[] {
        return _.sortBy(_.uniq(thisRequired.concat(otherRequired)));
    }

    private static intersectMinProperties(thisMinProperties: number, otherMinProperties: number): number {
        // TODO: can't be asserted without minProperties support:
        //  {minProperties: 1, type: 'object'} -> {minProperties: 2, type: 'object'}
        return Math.max(thisMinProperties, otherMinProperties);
    }

    private static getUniquePropertyNames(thisPropertyNames: string[], otherPropertyNames: string[]): string[] {
        return _.uniq(thisPropertyNames.concat(otherPropertyNames));
    }

    private static intersectProperties(
        objectSet1: SomeObjectSubset,
        objectSet2: SomeObjectSubset
    ): ParsedPropertiesKeyword {
        const allPropertyNames = SomeObjectSubset.getUniquePropertyNames(
            objectSet1.getPropertyNames(), objectSet2.getPropertyNames()
        );

        return allPropertyNames.reduce<ParsedPropertiesKeyword>((accumulator, propertyName) => {
            accumulator[propertyName] = objectSet1.getPropertySet(propertyName)
                .intersect(objectSet2.getPropertySet(propertyName));

            return accumulator;
        }, {});
    }

    public readonly type = 'some';

    public constructor(private readonly config: SomeObjectSubsetConfig) {
    }

    public get properties() {
        return this.config.properties;
    }

    public intersect(other: ObjectSubset): ObjectSubset {
        return other.intersectWithSome(this);
    }

    public intersectWithSome(other: SomeObjectSubset): ObjectSubset {
        return createObjectSubsetFromConfig({
            additionalProperties: this.config.additionalProperties.intersect(other.config.additionalProperties),
            minProperties:
                SomeObjectSubset.intersectMinProperties(this.config.minProperties, other.config.minProperties),
            properties: SomeObjectSubset.intersectProperties(this, other),
            required: SomeObjectSubset.intersectRequired(this.config.required, other.config.required)
        });
    }

    public complement(): ObjectSubset[] {
        const complementedProperties = this.complementProperties();
        const complementedAdditionalProperties = this.complementAdditionalProperties();
        const complementedRequiredProperties = this.complementRequiredProperties();
        return [...complementedAdditionalProperties, ...complementedProperties, ...complementedRequiredProperties];
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

    public getPropertySet(propertyName: string): Set<'json'> {
        return this.config.properties[propertyName] || this.config.additionalProperties;
    }

    public getPropertyNames(): string[] {
        return Object.keys(this.config.properties);
    }

    private toJsonSchemaMap(): SchemaProperties {
        return this.getPropertyNames().reduce<SchemaProperties>((acc, propertyName) => {
            acc[propertyName] = this.getPropertySet(propertyName).toJsonSchema();
            return acc;
        }, {});
    }

    private complementProperties(): ObjectSubset[] {
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

    private complementRequiredProperties(): ObjectSubset[] {
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

    private complementAdditionalProperties(): ObjectSubset[] {
        const defaultComplementedAdditionalProperties = [this.complementAdditionalPropertiesWithEmpty()];

        return this.getPropertyNames().length > 0
            ? defaultComplementedAdditionalProperties.concat(this.complementAdditionalPropertiesWithRequired())
            : defaultComplementedAdditionalProperties;
    }

    private complementAdditionalPropertiesWithEmpty(): ObjectSubset {
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

    private complementAdditionalPropertiesWithRequired(): ObjectSubset {
        return createObjectSubsetFromConfig({
            additionalProperties: this.config.additionalProperties.complement(),
            minProperties: 1 + Object.keys(this.config.properties).length,
            properties: this.config.properties,
            required: Object.keys(this.config.properties)
        });
    }
}

export const createObjectSubsetFromConfig = (config: SomeObjectSubsetConfig): ObjectSubset => {
    return hasContradictions(config)
        ? emptyObjectSubset
        : new SomeObjectSubset(config);
};
