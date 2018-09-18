import * as _ from 'lodash';
import {DiffResultOriginValue} from '../../../../api-types';
import {CoreDiffJsonSchema, DiffJsonSchema} from './diff-json-schema';

const sameOrigins = (
    origins: DiffResultOriginValue[] = [],
    otherOrigins: DiffResultOriginValue[] = []
) => {
    return _.intersectionWith(origins, otherOrigins, _.isEqual).length === origins.length
        && origins.length === otherOrigins.length;
};

const removeRedundantOrigins = (jsonSchema: CoreDiffJsonSchema): CoreDiffJsonSchema => {
    if (sameOrigins(jsonSchema['x-destination-origins'], jsonSchema['x-source-origins'])) {
        return _.omit(jsonSchema, ['x-destination-origins', 'x-source-origins']);
    }

    return jsonSchema;
};

const removeEmptyOrigins = (jsonSchema: CoreDiffJsonSchema): CoreDiffJsonSchema => {
    ['x-source-origins', 'x-destination-origins'].forEach((propertyName) => {
        const sourceOrigins = jsonSchema[propertyName];
        if (sourceOrigins && sourceOrigins.length === 0) {
            delete jsonSchema[propertyName];
        }
    });

    return jsonSchema;
};

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
        removeRedundantOrigins(
            removeEmptyOrigins(
                removeEmptyPropertiesObject(
                    removeEmptyRequireProperty(
                        removeEmptyMinProperties(originalSchema))))));
