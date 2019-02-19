import {DiffResult} from '../api-types';
import {dereferenceSchema} from './diff-schemas/dereference-schema';
import {parseAsJsonSet} from './diff-schemas/parse-as-json-set';
import {validateSchemas} from './diff-schemas/validate-schemas';

export const diffSchemas = async (sourceSchema: any, destinationSchema: any): Promise<DiffResult> => {
    const [dereferencedSourceSchema, dereferencedDestinationSchema] = await Promise.all([
        dereferenceSchema(sourceSchema), dereferenceSchema(destinationSchema)
    ]);

    await validateSchemas(sourceSchema, destinationSchema);

    const sourceSet = parseAsJsonSet(dereferencedSourceSchema);
    const destinationSet = parseAsJsonSet(dereferencedDestinationSchema);

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
