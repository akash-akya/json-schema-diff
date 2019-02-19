import {DiffResult} from '../api-types';
import {dereferenceSchema} from './diff-schemas/dereference-schema';
import {parseAsJsonSet} from './diff-schemas/parse-as-json-set';
import {Set} from './diff-schemas/set/set';
import {validateSchemas} from './diff-schemas/validate-schemas';

const logDebug = (setName: string, set: Set<'json'>) => {
    if (process.env.JSON_SCHEMA_DIFF_ENABLE_DEBUG === 'true') {
        console.log(`\n${setName}`);
        console.log(JSON.stringify(set.toJsonSchema(), null, 2));
    }
};

export const diffSchemas = async (sourceSchema: any, destinationSchema: any): Promise<DiffResult> => {
    const [dereferencedSourceSchema, dereferencedDestinationSchema] = await Promise.all([
        dereferenceSchema(sourceSchema), dereferenceSchema(destinationSchema)
    ]);

    await validateSchemas(sourceSchema, destinationSchema);

    const sourceSet = parseAsJsonSet(dereferencedSourceSchema);
    logDebug('sourceSet', sourceSet);
    const destinationSet = parseAsJsonSet(dereferencedDestinationSchema);
    logDebug('destinationSet', destinationSet);

    const intersectionOfSets = sourceSet.intersect(destinationSet);
    logDebug('intersectionOfSets', intersectionOfSets);
    const intersectionOfSetsComplement = intersectionOfSets.complement();
    logDebug('intersectionOfSetsComplement', intersectionOfSetsComplement);
    const addedToDestinationSet = intersectionOfSetsComplement.intersect(destinationSet);
    logDebug('addedToDestinationSet', addedToDestinationSet);
    const removedFromDestinationSet = intersectionOfSetsComplement.intersect(sourceSet);
    logDebug('removedFromDestinationSet', removedFromDestinationSet);

    return {
        addedJsonSchema: addedToDestinationSet.toJsonSchema(),
        additionsFound: addedToDestinationSet.type !== 'empty',
        removalsFound: removedFromDestinationSet.type !== 'empty',
        removedJsonSchema: removedFromDestinationSet.toJsonSchema()
    };
};
