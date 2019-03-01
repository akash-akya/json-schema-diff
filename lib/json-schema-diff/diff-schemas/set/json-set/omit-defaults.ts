import * as _ from 'lodash';
import {
    defaultMaxItems,
    defaultMinItems,
    defaultMinProperties,
    defaultProperties,
    defaultRequired
} from '../keyword-defaults';
import {CoreRepresentationJsonSchema, RepresentationJsonSchema} from '../set';

const omitDefaultAdditionalProperties = (schema: CoreRepresentationJsonSchema): CoreRepresentationJsonSchema => {
    return schema.additionalProperties === true
        ? _.omit(schema, ['additionalProperties'])
        : schema;
};

const omitEmptyProperties = (schema: CoreRepresentationJsonSchema): CoreRepresentationJsonSchema => {
    return _.isEqual(schema.properties, defaultProperties) ? _.omit(schema, ['properties']) : schema;
};

const omitEmptyRequired = (schema: CoreRepresentationJsonSchema): CoreRepresentationJsonSchema => {
    return _.isEqual(schema.required, defaultRequired)
        ? _.omit(schema, ['required'])
        : schema;
};

const omitDefaultMinProperties = (schema: CoreRepresentationJsonSchema): CoreRepresentationJsonSchema => {
    return schema.minProperties === defaultMinProperties
        ? _.omit(schema, ['minProperties'])
        : schema;
};

const omitDefaultItems = (schema: CoreRepresentationJsonSchema): CoreRepresentationJsonSchema => {
    return schema.items === true
        ? _.omit(schema, ['items'])
        : schema;
};

const omitDefaultMinItems = (schema: CoreRepresentationJsonSchema): CoreRepresentationJsonSchema => {
    return schema.minItems === defaultMinItems
        ? _.omit(schema, ['minItems'])
        : schema;
};

const omitDefaultMaxItems = (schema: CoreRepresentationJsonSchema): CoreRepresentationJsonSchema => {
    return schema.maxItems === defaultMaxItems
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
