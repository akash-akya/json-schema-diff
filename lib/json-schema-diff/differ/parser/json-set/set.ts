import {SimpleTypes} from 'json-schema-spec-types';
import * as _ from 'lodash';
import {Path} from '../../../../api-types';
import {DiffJsonSchema} from './diff-json-schema';

export interface OriginValue {
    path: Path;
    value: any;
}

export type SchemaOriginType = 'source' | 'destination';

export interface SchemaOrigin {
    path: Path;
    type: SchemaOriginType;
    value: any;
}

export interface ParsedRequiredKeyword {
    parsedValue: string[];
    origins: SchemaOrigin[];
}

export interface ParsedMinPropertiesKeyword {
    parsedValue: number;
    origins: SchemaOrigin[];
}

export interface ParsedSchemaKeywords {
    additionalProperties: Set<'json'>;
    type: ParsedTypeKeyword;
    properties: ParsedPropertiesKeyword;
    required: ParsedRequiredKeyword;
    minProperties: ParsedMinPropertiesKeyword;
}

export interface ParsedPropertiesKeyword {
    [key: string]: Set<'json'>;
}

export interface ParsedTypeKeyword {
    parsedValue: SimpleTypes[];
    origins: SchemaOrigin[];
}

export const allSchemaTypes: SimpleTypes[] = ['array', 'boolean', 'integer', 'null', 'number', 'object', 'string'];

export interface Set<T> {
    setType: T;
    type: 'all' | 'empty' | 'some';
    schemaOrigins: SchemaOrigin[];
    toAll(): Set<T>;
    toEmpty(): Set<T>;
    toJsonSchema(): DiffJsonSchema;
    intersect(otherSet: Set<T>): Set<T>;
    complement(): Set<T>;
}

export const toSourceOriginValues = (schemaOrigins: SchemaOrigin[]): OriginValue[] =>
    toOriginValues(schemaOrigins, 'source');

export const toDestinationOriginValues = (schemaOrigins: SchemaOrigin[]): OriginValue[] =>
    toOriginValues(schemaOrigins, 'destination');

const toOriginValues = (schemaOrigins: SchemaOrigin[], origin: SchemaOriginType): OriginValue[] => {
    const originValuesWithDuplications: OriginValue[] = schemaOrigins
        .filter((schemaOrigin) => schemaOrigin.type === origin)
        .map((schemaOrigin) => ({
            path: schemaOrigin.path,
            value: schemaOrigin.value
        }));

    return _.uniqWith(originValuesWithDuplications, _.isEqual);
};
