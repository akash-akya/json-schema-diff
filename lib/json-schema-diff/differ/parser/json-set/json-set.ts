// tslint:disable:max-classes-per-file
import {SimpleTypes} from 'json-schema-spec-types';
import * as _ from 'lodash';
import {DiffResultOriginValue} from '../../../../api-types';
import {allObjectSetFromJsonSet} from '../set-factories/create-object-set';
import {allTypeSetFromJsonSet} from '../set-factories/create-type-set';
import {CoreDiffJsonSchema, DiffJsonSchema, isCoreDiffJsonSchema} from './diff-json-schema';
import {sanitizeCoreDiffJsonSchema} from './sanitize-core-diff-json-schema';
import {
    allSchemaTypes,
    SchemaOrigin,
    Set,
    toDestinationOriginValues,
    toSourceOriginValues
} from './set';

interface JsonSet extends Set<'json'> {
    intersectWithAll(other: AllJsonSet): JsonSet;

    intersectWithEmpty(other: EmptyJsonSet): JsonSet;

    intersectWithSome(other: SomeJsonSet): JsonSet;
}

export class AllJsonSet implements JsonSet {
    public readonly setType = 'json';
    public readonly type = 'all';

    public constructor(public readonly schemaOrigins: SchemaOrigin[]) {
    }

    public toAll() {
        return this;
    }

    public toEmpty() {
        return new EmptyJsonSet(this.schemaOrigins);
    }

    public complement(): JsonSet {
        // TODO: can't be properly asserted without keywords support
        return new EmptyJsonSet(this.schemaOrigins);
    }

    public intersect(other: JsonSet): JsonSet {
        return other.intersectWithAll(this);
    }

    public intersectWithAll(other: AllJsonSet): JsonSet {
        // TODO: mergedSchemaOrigins can't be properly asserted without keywords support
        return new AllJsonSet(this.schemaOrigins.concat(other.schemaOrigins));
    }

    public intersectWithEmpty(other: EmptyJsonSet): JsonSet {
        return new EmptyJsonSet(this.schemaOrigins.concat(other.schemaOrigins));
    }

    public intersectWithSome(other: SomeJsonSet): JsonSet {
        return new SomeJsonSet({
            array: other.typeSets.array.intersect(allTypeSetFromJsonSet('array', this)),
            boolean: other.typeSets.boolean.intersect(allTypeSetFromJsonSet('boolean', this)),
            integer: other.typeSets.integer.intersect(allTypeSetFromJsonSet('integer', this)),
            null: other.typeSets.null.intersect(allTypeSetFromJsonSet('null', this)),
            number: other.typeSets.number.intersect(allTypeSetFromJsonSet('number', this)),
            object: other.typeSets.object.intersect(allObjectSetFromJsonSet(this)),
            string: other.typeSets.string.intersect(allTypeSetFromJsonSet('string', this))
        });
    }

    public toJsonSchema(): DiffJsonSchema {
        return sanitizeCoreDiffJsonSchema({
            'type': allSchemaTypes,
            'x-destination-origins': toDestinationOriginValues(this.schemaOrigins),
            'x-source-origins': toSourceOriginValues(this.schemaOrigins)
        });
    }
}

export class EmptyJsonSet implements JsonSet {
    public readonly setType = 'json';
    public readonly type = 'empty';

    public constructor(public readonly schemaOrigins: SchemaOrigin[]) {
    }

    public toAll() {
        return new AllJsonSet(this.schemaOrigins);
    }

    public toEmpty() {
        return this;
    }

    public complement(): JsonSet {
        return new AllJsonSet(this.schemaOrigins);
    }

    public intersect(other: JsonSet): JsonSet {
        return other.intersectWithEmpty(this);
    }

    public intersectWithEmpty(other: EmptyJsonSet): JsonSet {
        // TODO: can't be properly asserted without keywords support, e.g. {allOf: [false, false]} -> true
        return new EmptyJsonSet(this.schemaOrigins.concat(other.schemaOrigins));
    }

    public intersectWithAll(other: AllJsonSet): JsonSet {
        return new EmptyJsonSet(this.schemaOrigins.concat(other.schemaOrigins));
    }

    public intersectWithSome(other: SomeJsonSet): JsonSet {
        return new EmptyJsonSet(this.schemaOrigins.concat(other.schemaOrigins));
    }

    public toJsonSchema(): DiffJsonSchema {
        return false;
    }
}

export class SomeJsonSet implements JsonSet {
    private static createEmptyCoreDiffJsonSchema(): CoreDiffJsonSchema {
        return {
            type: []
        };
    }

    private static mergeCoreDiffJsonSchemas(
        schema: CoreDiffJsonSchema,
        otherSchema: CoreDiffJsonSchema
    ): CoreDiffJsonSchema {
        const schemaTypes = SomeJsonSet.getJsonSchemaTypeOrEmpty(schema);
        const otherSchemaTypes = SomeJsonSet.getJsonSchemaTypeOrEmpty(otherSchema);
        const type: SimpleTypes[] = schemaTypes.concat(otherSchemaTypes);

        const sourceOrigins = this.mergeOrigins(schema['x-source-origins'], otherSchema['x-source-origins']);
        const destinationOrigins = this.mergeOrigins(
            schema['x-destination-origins'], otherSchema['x-destination-origins']);

        const mergedSchema = {
            ...schema,
            ...otherSchema,
            type,
            'x-destination-origins': destinationOrigins,
            'x-source-origins': sourceOrigins
        };

        return mergedSchema;
    }

    private static mergeOrigins(
        originsA: DiffResultOriginValue[] = [],
        originsB: DiffResultOriginValue[] = []
    ): DiffResultOriginValue[] {
        const mergedOrigins = [...originsA, ...originsB];

        return _.uniqWith(mergedOrigins, _.isEqual);
    }

    private static toDiffJsonSchema(jsonSchema: CoreDiffJsonSchema): DiffJsonSchema {
        const jsonSchemaTypes = SomeJsonSet.getJsonSchemaTypeOrEmpty(jsonSchema);
        const jsonSchemaAnyOf = SomeJsonSet.getJsonSchemaAnyOfOrEmpty(jsonSchema);
        const isEmpty = jsonSchemaTypes.length === 0 && jsonSchemaAnyOf.length === 0;
        return isEmpty ? false : jsonSchema;
    }

    private static getJsonSchemaTypeOrEmpty(jsonSchema: CoreDiffJsonSchema): SimpleTypes[] {
        return jsonSchema.type || [];
    }

    private static getJsonSchemaAnyOfOrEmpty(jsonSchema: CoreDiffJsonSchema): DiffJsonSchema[] {
        return jsonSchema.anyOf || [];
    }

    private static toCoreDiffJsonSchema(schema: DiffJsonSchema): CoreDiffJsonSchema {
        return isCoreDiffJsonSchema(schema)
            ? schema
            : SomeJsonSet.createEmptyCoreDiffJsonSchema();
    }

    public readonly setType = 'json';

    public get type(): 'some' | 'empty' | 'all' {
        if (this.areAllTypeSetsOfType('empty')) {
            return 'empty';
        }

        if (this.areAllTypeSetsOfType('all')) {
            return 'all';
        }

        return 'some';
    }

    public constructor(public readonly typeSets: TypeSets) {
    }

    public toAll() {
        return new AllJsonSet(this.schemaOrigins);
    }

    public toEmpty() {
        return new EmptyJsonSet(this.schemaOrigins);
    }

    public get schemaOrigins(): SchemaOrigin[] {
        return Object.keys(this.typeSets).reduce(
            (allOrigins: SchemaOrigin[], typeSetName: keyof TypeSets) =>
                allOrigins.concat(this.typeSets[typeSetName].schemaOrigins),
            []
        );
    }

    public complement(): JsonSet {
        return new SomeJsonSet({
            array: this.typeSets.array.complement(),
            boolean: this.typeSets.boolean.complement(),
            integer: this.typeSets.integer.complement(),
            null: this.typeSets.null.complement(),
            number: this.typeSets.number.complement(),
            object: this.typeSets.object.complement(),
            string: this.typeSets.string.complement()
        });
    }

    public intersect(other: JsonSet): JsonSet {
        return other.intersectWithSome(this);
    }

    public intersectWithAll(other: AllJsonSet): JsonSet {
        return new SomeJsonSet({
            array: this.typeSets.array.intersect(allTypeSetFromJsonSet('array', other)),
            boolean: this.typeSets.boolean.intersect(allTypeSetFromJsonSet('boolean', other)),
            integer: this.typeSets.integer.intersect(allTypeSetFromJsonSet('integer', other)),
            null: this.typeSets.null.intersect(allTypeSetFromJsonSet('null', other)),
            number: this.typeSets.number.intersect(allTypeSetFromJsonSet('number', other)),
            object: this.typeSets.object.intersect(allObjectSetFromJsonSet(other)),
            string: this.typeSets.string.intersect(allTypeSetFromJsonSet('string', other))
        });
    }

    public intersectWithEmpty(other: EmptyJsonSet): JsonSet {
        return new EmptyJsonSet(this.schemaOrigins.concat(other.schemaOrigins));
    }

    public intersectWithSome(other: SomeJsonSet): JsonSet {
        return new SomeJsonSet({
            array: this.typeSets.array.intersect(other.typeSets.array),
            boolean: this.typeSets.boolean.intersect(other.typeSets.boolean),
            integer: this.typeSets.integer.intersect(other.typeSets.integer),
            null: this.typeSets.null.intersect(other.typeSets.null),
            number: this.typeSets.number.intersect(other.typeSets.number),
            object: this.typeSets.object.intersect(other.typeSets.object),
            string: this.typeSets.string.intersect(other.typeSets.string)
        });
    }

    public toJsonSchema(): DiffJsonSchema {
        const typeSetSchemas = Object
            .keys(this.typeSets)
            .map((typeSetName: keyof TypeSets) => this.getSubsetSchemaAsCoreDiffJsonSchema(typeSetName));

        const isSimpleSchema = (schema: CoreDiffJsonSchema) => !schema.anyOf || schema.anyOf.length <= 1;

        const mergedSimpleSubsetSchemas = typeSetSchemas
            .filter(isSimpleSchema)
            .map((schema): CoreDiffJsonSchema => {
                if (schema.anyOf) {
                    return SomeJsonSet.toCoreDiffJsonSchema(schema.anyOf[0]);
                }

                return schema;
            })
            .reduce((mergedSchema, schema) => {
                return SomeJsonSet.mergeCoreDiffJsonSchemas(mergedSchema, schema);
            }, SomeJsonSet.createEmptyCoreDiffJsonSchema());

        const mergedComplexSubsetSchemas = typeSetSchemas
            .filter((schema) => !isSimpleSchema(schema))
            .reduce<CoreDiffJsonSchema>((mergedSchema, schema) => {
                const mergedSchemaAnyOf = SomeJsonSet.getJsonSchemaAnyOfOrEmpty(mergedSchema);
                const schemaAnyOf = SomeJsonSet.getJsonSchemaAnyOfOrEmpty(schema);
                return {
                    anyOf: mergedSchemaAnyOf.concat(schemaAnyOf)
                };
            }, {});

        let result: CoreDiffJsonSchema;

        if (SomeJsonSet.getJsonSchemaAnyOfOrEmpty(mergedComplexSubsetSchemas).length === 0) {
            result = mergedSimpleSubsetSchemas;
        } else if (SomeJsonSet.getJsonSchemaTypeOrEmpty(mergedSimpleSubsetSchemas).length === 0) {
            result = mergedComplexSubsetSchemas;
        } else {
            const mergedAnyOf = SomeJsonSet.getJsonSchemaAnyOfOrEmpty(mergedComplexSubsetSchemas);
            mergedAnyOf.push(mergedSimpleSubsetSchemas);
            result = mergedComplexSubsetSchemas;
        }

        const sanitisedResult = sanitizeCoreDiffJsonSchema(result);
        return SomeJsonSet.toDiffJsonSchema(sanitisedResult);
    }

    private getSubsetSchemaAsCoreDiffJsonSchema(typeSetName: keyof TypeSets): CoreDiffJsonSchema {
        const typeSetSchema = this.typeSets[typeSetName].toJsonSchema();
        return SomeJsonSet.toCoreDiffJsonSchema(typeSetSchema);
    }

    private areAllTypeSetsOfType(setType: 'all' | 'empty') {
        return Object
            .keys(this.typeSets)
            .every((name: keyof TypeSets) => this.typeSets[name].type === setType);
    }
}

export interface TypeSets {
    array: Set<'array'>;
    boolean: Set<'boolean'>;
    integer: Set<'integer'>;
    number: Set<'number'>;
    null: Set<'null'>;
    object: Set<'object'>;
    string: Set<'string'>;
}
