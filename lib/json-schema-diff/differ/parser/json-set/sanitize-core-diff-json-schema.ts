import * as _ from 'lodash';
import {CoreDiffJsonSchema, DiffJsonSchema} from './diff-json-schema';

const removeEmptyPropertiesObject = (jsonSchema: CoreDiffJsonSchema): CoreDiffJsonSchema => {
    return jsonSchema.properties && Object.keys(jsonSchema.properties).length > 0
        ? jsonSchema
        : _.omit(jsonSchema, ['properties']);
};

const removeEmptyRequireProperty = (jsonSchema: CoreDiffJsonSchema): CoreDiffJsonSchema => {
    return jsonSchema.required && jsonSchema.required.length > 0
        ? jsonSchema
        : _.omit(jsonSchema, ['required']);
};

const removeEmptyMinProperties = (jsonSchema: CoreDiffJsonSchema): CoreDiffJsonSchema => {
    return jsonSchema.minProperties === 0
        ? _.omit(jsonSchema, ['minProperties'])
        : jsonSchema;
};

const sanitizeSchemaArray = (schemaArray: DiffJsonSchema[]): CoreDiffJsonSchema[] =>
    schemaArray.map((schema: CoreDiffJsonSchema) => sanitizeCoreDiffJsonSchema(schema));

const sanitizeAnyOfSchema = (jsonSchema: CoreDiffJsonSchema): CoreDiffJsonSchema => {
    return jsonSchema.anyOf
        ? {...jsonSchema, anyOf: sanitizeSchemaArray(jsonSchema.anyOf)}
        : jsonSchema;
};

export const sanitizeCoreDiffJsonSchema = (originalSchema: CoreDiffJsonSchema): CoreDiffJsonSchema =>
    sanitizeAnyOfSchema(
        removeEmptyPropertiesObject(
            removeEmptyRequireProperty(
                removeEmptyMinProperties(originalSchema))));
