import {JsonSchema, SimpleTypes} from 'json-schema-spec-types';
import {allTypes} from '../support/all-types';
import {invokeDiff} from '../support/invoke-diff';

describe('diff-schemas boolean schemas', () => {
    it('should not find differences between same boolean schemas', async () => {
        const sourceSchema: JsonSchema = true;
        const destinationSchema: JsonSchema = true;

        const diffResult = await invokeDiff(sourceSchema, destinationSchema);

        expect(diffResult.addedJsonSchema).toEqual(false);
        expect(diffResult.removedJsonSchema).toEqual(false);
    });

    it('should find differences between different boolean schemas', async () => {
        const sourceSchema: JsonSchema = false;
        const destinationSchema: JsonSchema = true;

        const diffResult = await invokeDiff(sourceSchema, destinationSchema);

        expect(diffResult.addedJsonSchema).toEqual(allTypes);
        expect(diffResult.removedJsonSchema).toEqual(false);
    });

    it('should find an add difference when schema is changed to true from all but one type', async () => {
        const allTypesButObject: SimpleTypes[] = ['string', 'array', 'number', 'integer', 'boolean', 'null'];
        const sourceSchema: JsonSchema = {
            type: allTypesButObject
        };
        const destinationSchema: JsonSchema = true;

        const diffResult = await invokeDiff(sourceSchema, destinationSchema);

        const allObjects: JsonSchema = {type: ['object']};
        expect(diffResult.addedJsonSchema).toEqual(allObjects);
        expect(diffResult.removedJsonSchema).toEqual(false);
    });

    it('should find a remove difference when schema is changed to false', async () => {
        const sourceSchema: JsonSchema = {type: 'string'};
        const destinationSchema: JsonSchema = false;

        const diffResult = await invokeDiff(sourceSchema, destinationSchema);

        const allStrings: JsonSchema = {type: ['string']};
        expect(diffResult.addedJsonSchema).toEqual(false);
        expect(diffResult.removedJsonSchema).toEqual(allStrings);
    });

    it('should find an add difference when schema is changed from false to some type', async () => {
        const sourceSchema: JsonSchema = false;
        const destinationSchema: JsonSchema = {type: 'string'};

        const diffResult = await invokeDiff(sourceSchema, destinationSchema);

        const allStrings: JsonSchema = {type: ['string']};
        expect(diffResult.addedJsonSchema).toEqual(allStrings);
        expect(diffResult.removedJsonSchema).toEqual(false);
    });
});
