// tslint:disable:max-classes-per-file
import {SimpleTypes} from 'json-schema-spec-types';
import {omitDefaults} from './json-set/omit-defaults';
import {
    CoreRepresentationJsonSchema,
    isCoreRepresentationJsonSchema,
    RepresentationJsonSchema,
    Set
} from './set';

interface JsonSet extends Set<'json'> {
    intersect(other: JsonSet): Set<'json'>;
    intersectWithSome(other: SomeJsonSet): Set<'json'>;
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

    public complement(): Set<'json'> {
        return emptyJsonSet;
    }

    public intersect(other: JsonSet): Set<'json'> {
        return other;
    }

    public intersectWithSome(other: SomeJsonSet): Set<'json'> {
        return other;
    }

    public toJsonSchema(): RepresentationJsonSchema {
        return true;
    }
}

export const allJsonSet = new AllJsonSet();

export class EmptyJsonSet implements JsonSet {
    public readonly setType = 'json';
    public readonly type = 'empty';

    public complement(): Set<'json'> {
        return allJsonSet;
    }

    public intersect(): Set<'json'> {
        return this;
    }

    public intersectWithSome(): Set<'json'> {
        return this;
    }

    public toJsonSchema(): RepresentationJsonSchema {
        return false;
    }
}

export const emptyJsonSet = new EmptyJsonSet();

export class SomeJsonSet implements JsonSet {
    private static isSimpleSchema(schema: CoreRepresentationJsonSchema): boolean {
        return !schema.anyOf || schema.anyOf.length <= 1;
    }

    private static createEmptyCoreRepresentationJsonSchema(): CoreRepresentationJsonSchema {
        return {
            type: []
        };
    }

    private static mergeCoreRepresentationJsonSchemas(
        schema: CoreRepresentationJsonSchema,
        otherSchema: CoreRepresentationJsonSchema
    ): CoreRepresentationJsonSchema {
        const schemaTypes = SomeJsonSet.getJsonSchemaTypeOrEmpty(schema);
        const otherSchemaTypes = SomeJsonSet.getJsonSchemaTypeOrEmpty(otherSchema);
        const type: SimpleTypes[] = schemaTypes.concat(otherSchemaTypes);

        return {
            ...schema,
            ...otherSchema,
            type
        };
    }

    private static toDiffJsonSchema(jsonSchema: CoreRepresentationJsonSchema): RepresentationJsonSchema {
        const jsonSchemaTypes = SomeJsonSet.getJsonSchemaTypeOrEmpty(jsonSchema);
        const jsonSchemaAnyOf = SomeJsonSet.getJsonSchemaAnyOfOrEmpty(jsonSchema);
        const isEmpty = jsonSchemaTypes.length === 0 && jsonSchemaAnyOf.length === 0;
        return isEmpty ? false : jsonSchema;
    }

    private static getJsonSchemaTypeOrEmpty(jsonSchema: CoreRepresentationJsonSchema): SimpleTypes[] {
        return jsonSchema.type || [];
    }

    private static getJsonSchemaAnyOfOrEmpty(jsonSchema: CoreRepresentationJsonSchema): RepresentationJsonSchema[] {
        return jsonSchema.anyOf || [];
    }

    private static toCoreRepresentationJsonSchema(schema: RepresentationJsonSchema): CoreRepresentationJsonSchema {
        return isCoreRepresentationJsonSchema(schema)
            ? schema
            : SomeJsonSet.createEmptyCoreRepresentationJsonSchema();
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

    public complement(): Set<'json'> {
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

    public intersect(other: JsonSet): Set<'json'> {
        return other.intersectWithSome(this);
    }

    public intersectWithSome(other: SomeJsonSet): Set<'json'> {
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

    public toJsonSchema(): RepresentationJsonSchema {
        const typeSetSchemas = Object
            .keys(this.typeSets)
            .map((typeSetName: keyof TypeSets) => this.getSubsetAsCoreRepresentationJsonSchema(typeSetName));

        const mergedSimpleSubsetSchemas = typeSetSchemas
            .filter(SomeJsonSet.isSimpleSchema)
            .map((schema): CoreRepresentationJsonSchema => {
                if (schema.anyOf) {
                    return SomeJsonSet.toCoreRepresentationJsonSchema(schema.anyOf[0]);
                }

                return schema;
            })
            .reduce((mergedSchema, schema) => {
                return SomeJsonSet.mergeCoreRepresentationJsonSchemas(mergedSchema, schema);
            }, SomeJsonSet.createEmptyCoreRepresentationJsonSchema());

        const mergedComplexSubsetSchemas = typeSetSchemas
            .filter((schema) => !SomeJsonSet.isSimpleSchema(schema))
            .reduce<CoreRepresentationJsonSchema>((mergedSchema, schema) => {
                const mergedSchemaAnyOf = SomeJsonSet.getJsonSchemaAnyOfOrEmpty(mergedSchema);
                const schemaAnyOf = SomeJsonSet.getJsonSchemaAnyOfOrEmpty(schema);
                return {
                    anyOf: mergedSchemaAnyOf.concat(schemaAnyOf)
                };
            }, {});

        let result: CoreRepresentationJsonSchema;

        if (SomeJsonSet.getJsonSchemaAnyOfOrEmpty(mergedComplexSubsetSchemas).length === 0) {
            result = mergedSimpleSubsetSchemas;
        } else if (SomeJsonSet.getJsonSchemaTypeOrEmpty(mergedSimpleSubsetSchemas).length === 0) {
            result = mergedComplexSubsetSchemas;
        } else {
            const mergedAnyOf = SomeJsonSet.getJsonSchemaAnyOfOrEmpty(mergedComplexSubsetSchemas);
            mergedAnyOf.push(mergedSimpleSubsetSchemas);
            result = mergedComplexSubsetSchemas;
        }

        const sanitisedResult = omitDefaults(result);
        return SomeJsonSet.toDiffJsonSchema(sanitisedResult);
    }

    private getSubsetAsCoreRepresentationJsonSchema(typeSetName: keyof TypeSets): CoreRepresentationJsonSchema {
        const typeSetSchema = this.typeSets[typeSetName].toJsonSchema();
        return SomeJsonSet.toCoreRepresentationJsonSchema(typeSetSchema);
    }

    private areAllTypeSetsOfType(setType: 'all' | 'empty') {
        return Object
            .keys(this.typeSets)
            .every((name: keyof TypeSets) => this.typeSets[name].type === setType);
    }
}
