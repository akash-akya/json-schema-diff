import * as _ from 'lodash';
import {CoreRepresentationJsonSchema, RepresentationJsonSchema} from '../set';

const omitDefaultAdditionalProperties = (schema: CoreRepresentationJsonSchema): CoreRepresentationJsonSchema => {
    return schema.additionalProperties === true
        ? _.omit(schema, ['additionalProperties'])
        : schema;
};

const omitEmptyProperties = (schema: CoreRepresentationJsonSchema): CoreRepresentationJsonSchema => {
    return schema.properties && Object.keys(schema.properties).length > 0
        ? schema
        : _.omit(schema, ['properties']);
};

const omitEmptyRequired = (schema: CoreRepresentationJsonSchema): CoreRepresentationJsonSchema => {
    return schema.required && schema.required.length > 0
        ? schema
        : _.omit(schema, ['required']);
};

const omitDefaultMinProperties = (schema: CoreRepresentationJsonSchema): CoreRepresentationJsonSchema => {
    return schema.minProperties === 0
        ? _.omit(schema, ['minProperties'])
        : schema;
};

const omitDefaultItems = (schema: CoreRepresentationJsonSchema): CoreRepresentationJsonSchema => {
    return schema.items === true
        ? _.omit(schema, ['items'])
        : schema;
};

const omitDefaultMinItems = (schema: CoreRepresentationJsonSchema): CoreRepresentationJsonSchema => {
    return schema.minItems === 0
        ? _.omit(schema, ['minItems'])
        : schema;
};

const omitDefaultMaxItems = (schema: CoreRepresentationJsonSchema): CoreRepresentationJsonSchema => {
    return schema.maxItems === Infinity
        ? _.omit(schema, ['maxItems'])
        : schema;
};

const omitDefaultsFromSchemaArray = (schemaArray: RepresentationJsonSchema[]): CoreRepresentationJsonSchema[] =>
    schemaArray.map((schema: CoreRepresentationJsonSchema) => omitDefaults(schema));

const omitDefaultsFromAnyOfSchema = (schema: CoreRepresentationJsonSchema): CoreRepresentationJsonSchema => {
    return schema.anyOf
        ? {...schema, anyOf: omitDefaultsFromSchemaArray(schema.anyOf)}
        : schema;
};

export const omitDefaults =
    (originalSchema: CoreRepresentationJsonSchema): CoreRepresentationJsonSchema =>
        omitDefaultsFromAnyOfSchema(
            omitDefaultAdditionalProperties(
                omitEmptyProperties(
                    omitEmptyRequired(
                        omitDefaultMinProperties(
                            omitDefaultMinItems(
                                omitDefaultMaxItems(
                                    omitDefaultItems(originalSchema))))))));
