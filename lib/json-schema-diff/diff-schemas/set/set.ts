import {CoreSchemaMetaSchema, SimpleTypes} from 'json-schema-spec-types';

export interface ParsedPropertiesKeyword {
    [key: string]: Set<'json'>;
}

export interface SchemaProperties {
    [name: string]: DiffJsonSchema;
}

export interface CoreDiffJsonSchema extends CoreSchemaMetaSchema {
    additionalProperties?: DiffJsonSchema;
    properties?: SchemaProperties;
    type?: SimpleTypes[];
    anyOf?: DiffJsonSchema[];
}

export type DiffJsonSchema = false | CoreDiffJsonSchema;

export interface Set<T> {
    setType: T;
    type: 'all' | 'empty' | 'some';
    toJsonSchema(): DiffJsonSchema;
    intersect(otherSet: Set<T>): Set<T>;
    complement(): Set<T>;
}

export const allSchemaTypes: SimpleTypes[] = ['array', 'boolean', 'integer', 'null', 'number', 'object', 'string'];

export const isCoreDiffJsonSchema =
    (diffJsonSchema: DiffJsonSchema): diffJsonSchema is CoreDiffJsonSchema => !!diffJsonSchema;
