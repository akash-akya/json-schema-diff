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

export type RepresentationJsonSchema = boolean | CoreRepresentationJsonSchema;

export interface Set<T> {
    setType: T;
    type: 'all' | 'empty' | 'some';
    complement(): Set<T>;
    intersect(other: Set<T>): Set<T>;
    toJsonSchema(): RepresentationJsonSchema;
}

export interface Subset<T> {
    setType: T;
    type: 'all' | 'empty' | 'some';
    complement(): Array<Subset<T>>;
    intersect(other: Subset<T>): Subset<T>;
    intersectWithSome(other: Subset<T>): Subset<T>;
    toJsonSchema(): RepresentationJsonSchema;
}

export const isCoreRepresentationJsonSchema =
    (schema: RepresentationJsonSchema): schema is CoreRepresentationJsonSchema => !!schema;
