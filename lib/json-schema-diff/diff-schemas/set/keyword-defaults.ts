import {SimpleTypes} from 'json-schema-spec-types';
import {ParsedPropertiesKeyword} from './set';

export const defaultProperties: ParsedPropertiesKeyword = {};
export const defaultMaxItems: number = Infinity;
export const defaultMaxProperties: number = Infinity;
export const defaultMinItems: number = 0;
export const defaultMinProperties: number = 0;
export const defaultRequired: string[] = [];
export const defaultTypes: SimpleTypes[] = ['array', 'boolean', 'integer', 'null', 'number', 'object', 'string'];
