import {SimpleTypes} from 'json-schema-spec-types';
import {DiffJsonSchema} from './diff-json-schema';

export interface ParsedSchemaKeywords {
    additionalProperties: Set<'json'>;
    type: SimpleTypes[];
    properties: ParsedPropertiesKeyword;
    required: string[];
    minProperties: number;
}

export interface ParsedPropertiesKeyword {
    [key: string]: Set<'json'>;
}

export const allSchemaTypes: SimpleTypes[] = ['array', 'boolean', 'integer', 'null', 'number', 'object', 'string'];

export interface Set<T> {
    setType: T;
    type: 'all' | 'empty' | 'some';
    toJsonSchema(): DiffJsonSchema;
    intersect(otherSet: Set<T>): Set<T>;
    complement(): Set<T>;
}
