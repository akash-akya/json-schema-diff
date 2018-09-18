import {CoreSchemaMetaSchema, SimpleTypes} from 'json-schema-spec-types';
import {DiffResultOriginValue} from '../../../../api-types';

export interface CoreDiffJsonSchema extends CoreSchemaMetaSchema {
    additionalProperties?: DiffJsonSchema;
    properties?: SchemaProperties;
    type?: SimpleTypes[];
    anyOf?: DiffJsonSchema[];
    'x-destination-origins'?: DiffResultOriginValue[];
    'x-source-origins'?: DiffResultOriginValue[];
}

export type DiffJsonSchema = false | CoreDiffJsonSchema;

export interface SchemaProperties {
    [name: string]: DiffJsonSchema;
}

export const isCoreDiffJsonSchema =
    (diffJsonSchema: DiffJsonSchema): diffJsonSchema is CoreDiffJsonSchema => !!diffJsonSchema;
