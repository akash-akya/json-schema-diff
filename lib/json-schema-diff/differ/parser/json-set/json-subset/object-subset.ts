// tslint:disable:max-classes-per-file

import * as _ from 'lodash';
import {DiffJsonSchema, SchemaProperties} from '../diff-json-schema';
import {
    ParsedMinPropertiesKeyword,
    ParsedPropertiesKeyword,
    ParsedRequiredKeyword,
    SchemaOrigin,
    Set,
    toDestinationOriginValues,
    toSourceOriginValues
} from '../set';
import {hasContradictions} from './object-subset/has-contradictions';

export interface ObjectSubset {
    type: 'all' | 'empty' | 'some';
    additionalProperties: Set<'json'>;
    properties: ParsedPropertiesKeyword;
    schemaOrigins: SchemaOrigin[];

    toJsonSchema(): DiffJsonSchema;

    intersect(otherSet: ObjectSubset): ObjectSubset;

    complement(): ObjectSubset[];

    intersectWithAll(other: AllObjectSubset): ObjectSubset;

    intersectWithEmpty(other: EmptyObjectSubset): ObjectSubset;

    intersectWithSome(other: SomeObjectSubset): ObjectSubset;

    getPropertySet(propertyName: string): Set<'json'>;

    getPropertyNames(): string[];
}

export class AllObjectSubset implements ObjectSubset {
    public readonly type = 'all';

    public constructor(
        public readonly schemaOrigins: SchemaOrigin[],
        public readonly properties: ParsedPropertiesKeyword,
        public additionalProperties: Set<'json'>
    ) {
    }

    public intersect(other: ObjectSubset): ObjectSubset {
        return other.intersectWithAll(this);
    }

    public intersectWithSome(other: SomeObjectSubset): ObjectSubset {
        return intersectAllAndSome(this, other);
    }

    public intersectWithAll(other: AllObjectSubset): ObjectSubset {
        return new AllObjectSubset(
            this.schemaOrigins.concat(other.schemaOrigins),
            intersectProperties(this, other),
            this.additionalProperties.intersect(other.additionalProperties)
        );
    }

    public intersectWithEmpty(other: EmptyObjectSubset): ObjectSubset {
        return intersectEmptyAndOther(other, this);
    }

    // TODO: this can return a simple empty when we remove origins
    public complement(): ObjectSubset[] {
        const complementedProps = this.complementProperties();

        return [new EmptyObjectSubset(
            this.schemaOrigins,
            complementedProps,
            this.additionalProperties.complement()
        )];
    }

    public toJsonSchema(): DiffJsonSchema {
        return {
            'type': ['object'],
            'x-destination-origins': toDestinationOriginValues(this.schemaOrigins),
            'x-source-origins': toSourceOriginValues(this.schemaOrigins)
        };
    }

    public getPropertyNames(): string[] {
        return Object.keys(this.properties);
    }

    public getPropertySet(propertyName: string): Set<'json'> {
        return this.properties[propertyName] ? this.properties[propertyName] : this.additionalProperties;
    }

    private complementProperties(): ParsedPropertiesKeyword {
        const propertyNames = this.getPropertyNames();

        return propertyNames.reduce<ParsedPropertiesKeyword>((acc, propertyName) => {
            acc[propertyName] = this.properties[propertyName].complement();
            return acc;
        }, {});
    }
}

export class EmptyObjectSubset implements ObjectSubset {
    public readonly type = 'empty';

    public constructor(
        public readonly schemaOrigins: SchemaOrigin[],
        public readonly properties: ParsedPropertiesKeyword,
        public additionalProperties: Set<'json'>
    ) {
    }

    public intersect(other: ObjectSubset): ObjectSubset {
        return other.intersectWithEmpty(this);
    }

    public intersectWithAll(other: AllObjectSubset): ObjectSubset {
        return intersectEmptyAndOther(this, other);
    }

    public intersectWithSome(other: SomeObjectSubset): ObjectSubset {
        return intersectEmptyAndOther(this, other);
    }

    public intersectWithEmpty(other: EmptyObjectSubset): ObjectSubset {
        // TODO: this can't be asserted without keywords support
        return intersectEmptyAndOther(this, other);
    }

    public complement(): ObjectSubset[] {
        const complementedProps = this.complementProperties();

        return [new AllObjectSubset(
            this.schemaOrigins,
            complementedProps,
            this.additionalProperties.complement()
        )];
    }

    public toJsonSchema(): DiffJsonSchema {
        return false;
    }

    public getPropertySet(propertyName: string): Set<'json'> {
        return this.properties[propertyName] ? this.properties[propertyName] : this.additionalProperties;
    }

    public getPropertyNames(): string[] {
        return Object.keys(this.properties);
    }

    private complementProperties(): ParsedPropertiesKeyword {
        const propertyNames = this.getPropertyNames();

        return propertyNames.reduce<ParsedPropertiesKeyword>((acc, propertyName) => {
            acc[propertyName] = this.properties[propertyName].complement();
            return acc;
        }, {});
    }
}

export interface SomeObjectSubsetConfig {
    schemaOrigins: SchemaOrigin[];
    properties: ParsedPropertiesKeyword;
    additionalProperties: Set<'json'>;
    minProperties: ParsedMinPropertiesKeyword;
    required: ParsedRequiredKeyword;
}

export class SomeObjectSubset implements ObjectSubset {
    public readonly type = 'some';

    public constructor(public readonly config: SomeObjectSubsetConfig) {
    }

    public get additionalProperties() {
        return this.config.additionalProperties;
    }

    public get properties() {
        return this.config.properties;
    }

    public get schemaOrigins() {
        return this.config.schemaOrigins;
    }

    public intersect(other: ObjectSubset): ObjectSubset {
        return other.intersectWithSome(this);
    }

    public intersectWithSome(other: SomeObjectSubset): ObjectSubset {
        // TODO: delete schema origins
        return createObjectSubsetFromConfig({
            additionalProperties: this.config.additionalProperties.intersect(other.config.additionalProperties),
            minProperties: intersectMinProperties(this.config.minProperties, other.config.minProperties),
            properties: intersectProperties(this, other),
            required: intersectRequired(this.config.required, other.config.required),
            schemaOrigins: this.config.schemaOrigins.concat(other.config.schemaOrigins)
        });
    }

    public intersectWithAll(other: AllObjectSubset): ObjectSubset {
        return intersectAllAndSome(other, this);
    }

    public intersectWithEmpty(other: EmptyObjectSubset): ObjectSubset {
        return intersectEmptyAndOther(other, this);
    }

    public complement(): ObjectSubset[] {
        const complementedProperties = this.complementProperties();
        const complementedAdditionalProperties = this.complementAdditionalProperties();
        const complementedRequiredProperties = this.complementRequiredProperties();
        return [...complementedAdditionalProperties, ...complementedProperties, ...complementedRequiredProperties];
    }

    public toJsonSchema(): DiffJsonSchema {
        const properties = this.toJsonSchemaMap();
        const additionalProperties = this.config.additionalProperties.toJsonSchema();
        return {
            additionalProperties,
            'minProperties': this.config.minProperties.parsedValue,
            properties,
            'required': this.config.required.parsedValue,
            'type': ['object'],
            'x-destination-origins': toDestinationOriginValues(this.config.schemaOrigins),
            'x-source-origins': toSourceOriginValues(this.config.schemaOrigins)
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

    private complementProperties() {
        return this.getPropertyNames().map((propertyName) => {
            const complementedPropertySchema = this.getPropertySet(propertyName).complement();

            return createObjectSubsetFromConfig({
                    additionalProperties: this.config.additionalProperties.toAll(),
                    // TODO: Untestable today, need:
                    //  not: {properties: {name: {type: 'string'}, minProperties: 1, type: 'object'} -> true
                    minProperties: {...this.config.minProperties, parsedValue: 0},
                    properties: {[propertyName]: complementedPropertySchema},
                    required: {
                        origins: complementedPropertySchema.schemaOrigins,
                        parsedValue: [propertyName]
                    },
                    schemaOrigins: this.config.schemaOrigins
                }
            );
        });
    }

    private complementRequiredProperties() {
        return this.config.required.parsedValue.map((requiredPropertyName) =>
            createObjectSubsetFromConfig({
                additionalProperties: this.config.additionalProperties.toAll(),
                minProperties: {origins: [], parsedValue: 0},
                properties: {
                    [requiredPropertyName]: this.getPropertySet(requiredPropertyName).toEmpty()
                },
                required: {
                    origins: [],
                    parsedValue: []
                },
                schemaOrigins: this.schemaOrigins
            }));
    }

    private complementAdditionalProperties() {
        const defaultComplementedAdditionalProperties = [this.complementAdditionalPropertiesWithEmpty()];

        return this.getPropertyNames().length > 0
            ? defaultComplementedAdditionalProperties.concat(this.complementAdditionalPropertiesWithRequired())
            : defaultComplementedAdditionalProperties;
    }

    private complementAdditionalPropertiesWithEmpty(): ObjectSubset {
        const propertyNames = this.getPropertyNames();

        const emptyProperties = propertyNames
            .reduce<ParsedPropertiesKeyword>((acc, propertyName) => {
                acc[propertyName] = this.config.properties[propertyName].toEmpty();
                return acc;
            }, {});

        return createObjectSubsetFromConfig({
            additionalProperties: this.config.additionalProperties.complement(),
            minProperties: {
                origins: this.config.minProperties.origins,
                parsedValue: 1
            },
            properties: emptyProperties,
            required: {...this.config.required, parsedValue: []},
            schemaOrigins: this.config.schemaOrigins
        });
    }

    private complementAdditionalPropertiesWithRequired(): ObjectSubset {
        return createObjectSubsetFromConfig({
            additionalProperties: this.config.additionalProperties.complement(),
            minProperties: {
                origins: this.config.minProperties.origins,
                parsedValue: 1 + Object.keys(this.config.properties).length
            },
            properties: this.config.properties,
            required: {...this.config.required, parsedValue: Object.keys(this.config.properties)},
            schemaOrigins: this.config.schemaOrigins
        });
    }
}

const intersectAllAndSome = (allObjectSet: AllObjectSubset, someObjectSet: SomeObjectSubset): ObjectSubset => {
    const mergedSchemaOrigins = allObjectSet.schemaOrigins.concat(someObjectSet.config.schemaOrigins);
    const mergedProperties = intersectProperties(allObjectSet, someObjectSet);
    const mergedAdditionalProperties = allObjectSet.additionalProperties
        .intersect(someObjectSet.config.additionalProperties);

    return createObjectSubsetFromConfig({
        additionalProperties: mergedAdditionalProperties,
        minProperties: someObjectSet.config.minProperties,
        properties: mergedProperties,
        required: someObjectSet.config.required,
        schemaOrigins: mergedSchemaOrigins
    });
};

const intersectEmptyAndOther = (
    emptyObjectSet: EmptyObjectSubset, otherObjectSet: ObjectSubset
): EmptyObjectSubset => {
    const mergedSchemaOrigins = emptyObjectSet.schemaOrigins.concat(otherObjectSet.schemaOrigins);
    const mergedProperties = intersectProperties(emptyObjectSet, otherObjectSet);
    const mergedAdditionalProperties = emptyObjectSet.additionalProperties
        .intersect(otherObjectSet.additionalProperties);

    return new EmptyObjectSubset(mergedSchemaOrigins, mergedProperties, mergedAdditionalProperties);
};

const intersectMinProperties = (
    thisMinProperties: ParsedMinPropertiesKeyword, otherMinProperties: ParsedMinPropertiesKeyword
): ParsedMinPropertiesKeyword => {
    return {
        origins: [],
        // TODO: can't be asserted without minProperties support:
        //  {minProperties: 1, type: 'object'} -> {minProperties: 2, type: 'object'}
        parsedValue: Math.max(thisMinProperties.parsedValue, otherMinProperties.parsedValue)
    };
};

const getUniquePropertyNames = (thisPropertyNames: string[], otherPropertyNames: string[]): string[] =>
    _.uniq(thisPropertyNames.concat(otherPropertyNames));

const intersectProperties = (objectSet1: ObjectSubset, objectSet2: ObjectSubset) => {
    const allPropertyNames = getUniquePropertyNames(objectSet1.getPropertyNames(), objectSet2.getPropertyNames());

    return allPropertyNames.reduce<ParsedPropertiesKeyword>((accumulator, propertyName) => {
        accumulator[propertyName] = objectSet1.getPropertySet(propertyName)
            .intersect(objectSet2.getPropertySet(propertyName));

        return accumulator;
    }, {});
};

const intersectRequired = (
    thisRequired: ParsedRequiredKeyword, otherRequired: ParsedRequiredKeyword
): ParsedRequiredKeyword => {
    return {
        origins: [],
        parsedValue: _.sortBy(_.uniq(thisRequired.parsedValue.concat(otherRequired.parsedValue)))
    };
};

export const createObjectSubsetFromConfig = (config: SomeObjectSubsetConfig): ObjectSubset => {
    return hasContradictions(config)
        ? new EmptyObjectSubset(config.schemaOrigins, config.properties, config.additionalProperties.toEmpty())
        : new SomeObjectSubset(config);
};
