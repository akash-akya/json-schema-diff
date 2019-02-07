// tslint:disable:max-classes-per-file
import {SimpleTypes} from 'json-schema-spec-types';
import {CoreDiffJsonSchema, DiffJsonSchema, isCoreDiffJsonSchema} from './diff-json-schema';
import {sanitizeCoreDiffJsonSchema} from './sanitize-core-diff-json-schema';
import {allSchemaTypes, Set} from './set';

interface JsonSet extends Set<'json'> {
    intersectWithSome(other: SomeJsonSet): JsonSet;
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

export class AllJsonSet implements JsonSet {
    public readonly setType = 'json';
    public readonly type = 'all';

    public complement(): JsonSet {
        return emptyJsonSet;
    }

    public intersect(other: JsonSet): JsonSet {
        return other;
    }

    public intersectWithSome(other: SomeJsonSet): JsonSet {
        return other;
    }

    public toJsonSchema(): DiffJsonSchema {
        return sanitizeCoreDiffJsonSchema({type: allSchemaTypes});
    }
}

export const allJsonSet = new AllJsonSet();

export class EmptyJsonSet implements JsonSet {
    public readonly setType = 'json';
    public readonly type = 'empty';

    public complement(): JsonSet {
        return allJsonSet;
    }

    public intersect(): JsonSet {
        return this;
    }

    public intersectWithSome(): JsonSet {
        return this;
    }

    public toJsonSchema(): DiffJsonSchema {
        return false;
    }
}

export const emptyJsonSet = new EmptyJsonSet();

export class SomeJsonSet implements JsonSet {
    private static isSimpleSchema(schema: CoreDiffJsonSchema): boolean {
        return !schema.anyOf || schema.anyOf.length <= 1;
    }

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

        return {
            ...schema,
            ...otherSchema,
            type
        };
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

        const mergedSimpleSubsetSchemas = typeSetSchemas
            .filter(SomeJsonSet.isSimpleSchema)
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
            .filter((schema) => !SomeJsonSet.isSimpleSchema(schema))
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
