import * as _ from 'lodash';
import {CoreRepresentationJsonSchema, RepresentationJsonSchema} from '../set';

const removeEmptyPropertiesObject = (schema: CoreRepresentationJsonSchema): CoreRepresentationJsonSchema => {
    return schema.properties && Object.keys(schema.properties).length > 0
        ? schema
        : _.omit(schema, ['properties']);
};

const removeEmptyRequireProperty = (schema: CoreRepresentationJsonSchema): CoreRepresentationJsonSchema => {
    return schema.required && schema.required.length > 0
        ? schema
        : _.omit(schema, ['required']);
};

const removeEmptyMinProperties = (schema: CoreRepresentationJsonSchema): CoreRepresentationJsonSchema => {
    return schema.minProperties === 0
        ? _.omit(schema, ['minProperties'])
        : schema;
};

const removeEmptyMinItems = (schema: CoreRepresentationJsonSchema): CoreRepresentationJsonSchema => {
    return schema.minItems === 0
        ? _.omit(schema, ['minItems'])
        : schema;
};

const sanitizeSchemaArray = (schemaArray: RepresentationJsonSchema[]): CoreRepresentationJsonSchema[] =>
    schemaArray.map((schema: CoreRepresentationJsonSchema) => sanitizeCoreRepresentationJsonSchema(schema));

const sanitizeAnyOfSchema = (schema: CoreRepresentationJsonSchema): CoreRepresentationJsonSchema => {
    return schema.anyOf
        ? {...schema, anyOf: sanitizeSchemaArray(schema.anyOf)}
        : schema;
};

export const sanitizeCoreRepresentationJsonSchema =
    (originalSchema: CoreRepresentationJsonSchema): CoreRepresentationJsonSchema =>
        sanitizeAnyOfSchema(
            removeEmptyPropertiesObject(
                removeEmptyRequireProperty(
                    removeEmptyMinProperties(
                        removeEmptyMinItems(originalSchema)))));
