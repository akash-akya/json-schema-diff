import {CoreSchemaMetaSchema, SimpleTypes} from 'json-schema-spec-types';

export interface ParsedPropertiesKeyword {
    [key: string]: Set<'json'>;
}

export interface SchemaProperties {
    [name: string]: RepresentationJsonSchema;
}

export interface CoreRepresentationJsonSchema extends CoreSchemaMetaSchema {
    additionalProperties?: RepresentationJsonSchema;
    properties?: SchemaProperties;
    type?: SimpleTypes[];
    anyOf?: RepresentationJsonSchema[];
}

export type RepresentationJsonSchema = false | CoreRepresentationJsonSchema;

export interface Set<T> {
    setType: T;
    type: 'all' | 'empty' | 'some';
    toJsonSchema(): RepresentationJsonSchema;
    intersect(other: Set<T>): Set<T>;
    complement(): Set<T>;
}

export const allSchemaTypes: SimpleTypes[] = ['array', 'boolean', 'integer', 'null', 'number', 'object', 'string'];

export const isCoreRepresentationJsonSchema =
    (schema: RepresentationJsonSchema): schema is CoreRepresentationJsonSchema => !!schema;
