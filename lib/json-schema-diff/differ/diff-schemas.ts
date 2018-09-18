import RefParser = require('json-schema-ref-parser');
import {JsonSchema} from 'json-schema-spec-types';
import {isBoolean} from 'util';
import {DiffResult} from '../../api-types';
import {parseAsJsonSet} from './parser/parse-as-json-set';
import {validateSchemas} from './validate-schemas';

export const dereferenceSchema = async (schema: JsonSchema): Promise<JsonSchema> => {
    const refParser = new RefParser();
    return isBoolean(schema)
        ? schema
        : await refParser.dereference(schema as object, {dereference: {circular: false}}) as JsonSchema;
};

export const diffSchemas = async (sourceSchema: JsonSchema,
                                  destinationSchema: JsonSchema): Promise<DiffResult> => {

    const [dereferencedSourceSchema, dereferencedDestinationSchema] = await Promise.all([
        dereferenceSchema(sourceSchema), dereferenceSchema(destinationSchema)
    ]);

    await validateSchemas(sourceSchema, destinationSchema);

    const sourceSet = parseAsJsonSet(dereferencedSourceSchema, 'source');
    const destinationSet = parseAsJsonSet(dereferencedDestinationSchema, 'destination');

    const intersectionOfSets = sourceSet.intersect(destinationSet);
    const intersectionOfSetsComplement = intersectionOfSets.complement();
    const addedToDestinationSet = intersectionOfSetsComplement.intersect(destinationSet);
    const removedFromDestinationSet = intersectionOfSetsComplement.intersect(sourceSet);

    return {
        addedJsonSchema: addedToDestinationSet.toJsonSchema(),
        additionsFound: addedToDestinationSet.type !== 'empty',
        removalsFound: removedFromDestinationSet.type !== 'empty',
        removedJsonSchema: removedFromDestinationSet.toJsonSchema()
    };
};
