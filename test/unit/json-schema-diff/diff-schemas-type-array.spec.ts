import {JsonSchema, SimpleTypes} from 'json-schema-spec-types';
import {invokeDiff} from '../support/invoke-diff';

describe('diff-schemas type array', () => {
    it('should find removed differences within array schemas that have constrained', async () => {
        const sourceSchema: JsonSchema = {
            items: {
                type: ['string', 'number']
            },
            type: 'array'
        };
        const destinationSchema: JsonSchema = {
            items: {
                type: 'number'
            },
            type: 'array'
        };

        const diffResult = await invokeDiff(sourceSchema, destinationSchema);

        const allArraysOfTypeStringWithAtLeastOneItem: JsonSchema = {
            items: {
                type: ['string']
            },
            minItems: 1,
            type: ['array']
        };
        expect(diffResult.addedJsonSchema).toEqual(false);
        expect(diffResult.removedJsonSchema).toEqual(allArraysOfTypeStringWithAtLeastOneItem);
    });

    it('should find added differences within array schemas that have expanded', async () => {
        const sourceSchema: JsonSchema = {
            items: {
                type: 'number'
            },
            type: 'array'
        };
        const destinationSchema: JsonSchema = {
            items: {
                type: ['string', 'number']
            },
            type: 'array'
        };

        const diffResult = await invokeDiff(sourceSchema, destinationSchema);

        const allArraysOfTypeStringWithAtLeastOneItem: JsonSchema = {
            items: {
                type: ['string']
            },
            minItems: 1,
            type: ['array']
        };
        expect(diffResult.addedJsonSchema).toEqual(allArraysOfTypeStringWithAtLeastOneItem);
        expect(diffResult.removedJsonSchema).toEqual(false);
    });

    it('should find differences within array schemas that have changed', async () => {
        const sourceSchema: JsonSchema = {
            items: {
                type: 'number'
            },
            type: 'array'
        };
        const destinationSchema: JsonSchema = {
            items: {
                type: 'string'
            },
            type: 'array'
        };

        const diffResult = await invokeDiff(sourceSchema, destinationSchema);

        const allArraysOfTypeStringWithAtLeastOneItem: JsonSchema = {
            items: {
                type: ['string']
            },
            minItems: 1,
            type: ['array']
        };
        const allArraysOfTypeNumberWithAtLeastOneItem: JsonSchema = {
            items: {
                type: ['number']
            },
            minItems: 1,
            type: ['array']
        };
        expect(diffResult.addedJsonSchema).toEqual(allArraysOfTypeStringWithAtLeastOneItem);
        expect(diffResult.removedJsonSchema).toEqual(allArraysOfTypeNumberWithAtLeastOneItem);
    });

    it('should find a remove difference when a constrained array is removed', async () => {
        const sourceSchema: JsonSchema = {
            items: {
                type: 'number'
            },
            type: 'array'
        };
        const destinationSchema: JsonSchema = false;

        const diffResult = await invokeDiff(sourceSchema, destinationSchema);

        const allArraysOfTypeNumber: JsonSchema = {
            items: {
                type: ['number']
            },
            type: ['array']
        };
        expect(diffResult.addedJsonSchema).toEqual(false);
        expect(diffResult.removedJsonSchema).toEqual(allArraysOfTypeNumber);
    });

    it('should find a removed difference when a constraint is added to arrays', async () => {
        const sourceSchema: JsonSchema = {
            type: 'array'
        };
        const destinationSchema: JsonSchema = {
            items: {
                type: 'number'
            },
            type: 'array'
        };

        const diffResult = await invokeDiff(sourceSchema, destinationSchema);

        const allTypesExceptNumber: SimpleTypes[] = ['array', 'boolean', 'integer', 'null', 'object', 'string'];
        const allArraysOfAllTypesExceptNumberWithAtLeastOneItem: JsonSchema = {
            items: {
                type: allTypesExceptNumber
            },
            minItems: 1,
            type: ['array']
        };
        expect(diffResult.addedJsonSchema).toEqual(false);
        expect(diffResult.removedJsonSchema).toEqual(allArraysOfAllTypesExceptNumberWithAtLeastOneItem);
    });
});
