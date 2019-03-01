import {JsonSchemaMap, SimpleTypes} from 'json-schema-spec-types';

export const defaultProperties: JsonSchemaMap = {};
export const defaultMinItems: number = 0;
export const defaultMinProperties: number = 0;
export const defaultMaxItems: number = Infinity;
export const defaultRequired: string[] = [];
export const defaultTypes: SimpleTypes[] = ['array', 'boolean', 'integer', 'null', 'number', 'object', 'string'];
