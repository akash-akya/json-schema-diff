import RefParser = require('json-schema-ref-parser');
import {JsonSchema} from 'json-schema-spec-types';
import {isBoolean} from 'util';

export const dereferenceSchema = async (schema: JsonSchema): Promise<JsonSchema> => {
    const refParser = new RefParser();
    return isBoolean(schema)
        ? schema
        : await refParser.dereference(schema as object, {dereference: {circular: false}}) as JsonSchema;
};
