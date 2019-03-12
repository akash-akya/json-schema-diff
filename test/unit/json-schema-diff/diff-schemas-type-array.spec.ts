import {JsonSchema, SimpleTypes} from 'json-schema-spec-types';
import {invokeDiff} from '../support/invoke-diff';

describe('diff-schemas type array', () => {
    describe('items', () => {
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

    describe('minItems', () => {
        it('should find a remove difference if array with minItems constraint is removed', async () => {
            const sourceSchema: JsonSchema = {
                minItems: 1,
                type: 'array'
            };
            const destinationSchema: JsonSchema = false;

            const diffResult = await invokeDiff(sourceSchema, destinationSchema);

            const arraysWithAtLeastOneItem: JsonSchema = {
                minItems: 1,
                type: ['array']
            };
            expect(diffResult.addedJsonSchema).toEqual(false);
            expect(diffResult.removedJsonSchema).toEqual(arraysWithAtLeastOneItem);
        });

        it('should find a remove difference when array is constrained with minItems', async () => {
            const sourceSchema: JsonSchema = {
                type: 'array'
            };
            const destinationSchema: JsonSchema = {
                minItems: 2,
                type: 'array'
            };

            const diffResult = await invokeDiff(sourceSchema, destinationSchema);

            const arraysWithUpToOneItem: JsonSchema = {
                maxItems: 1,
                type: ['array']
            };
            expect(diffResult.addedJsonSchema).toEqual(false);
            expect(diffResult.removedJsonSchema).toEqual(arraysWithUpToOneItem);
        });

        it('should find a removed difference with correct minItems-maxItems constraint range', async () => {
            const sourceSchema: JsonSchema = {
                minItems: 2,
                type: 'array'
            };
            const destinationSchema: JsonSchema = {
                minItems: 4,
                type: 'array'
            };

            const diffResult = await invokeDiff(sourceSchema, destinationSchema);

            const arraysWithNoItems: JsonSchema = {
                maxItems: 3,
                minItems: 2,
                type: ['array']
            };
            expect(diffResult.addedJsonSchema).toEqual(false);
            expect(diffResult.removedJsonSchema).toEqual(arraysWithNoItems);
        });

        it('should return a remove difference representing the empty array value', async () => {
            const sourceSchema: JsonSchema = {
                type: 'array'
            };
            const destinationSchema: JsonSchema = {
                minItems: 1,
                type: 'array'
            };

            const diffResult = await invokeDiff(sourceSchema, destinationSchema);

            const arraysWithNoItems: JsonSchema = {
                maxItems: 0,
                type: ['array']
            };
            expect(diffResult.addedJsonSchema).toEqual(false);
            expect(diffResult.removedJsonSchema).toEqual(arraysWithNoItems);
        });
    });

    describe('maxItems', () => {
        it('should find a remove difference when an array with maxItems constraint is removed', async () => {
            const sourceSchema: JsonSchema = {
                maxItems: 2,
                type: 'array'
            };
            const destinationSchema: JsonSchema = false;

            const diffResult = await invokeDiff(sourceSchema, destinationSchema);

            const allArraysWithAtMostTwoItems: JsonSchema = {
                maxItems: 2,
                type: ['array']
            };
            expect(diffResult.addedJsonSchema).toEqual(false);
            expect(diffResult.removedJsonSchema).toEqual(allArraysWithAtMostTwoItems);
        });

        it('should find a removed difference when an array is constrained with maxItems', async () => {
            const sourceSchema: JsonSchema = {
                type: 'array'
            };
            const destinationSchema: JsonSchema = {
                maxItems: 2,
                type: 'array'
            };

            const diffResult = await invokeDiff(sourceSchema, destinationSchema);

            const allArraysWithAtLeastThreeItems: JsonSchema = {
                minItems: 3,
                type: ['array']
            };
            expect(diffResult.addedJsonSchema).toEqual(false);
            expect(diffResult.removedJsonSchema).toEqual(allArraysWithAtLeastThreeItems);
        });

        it('should find an added difference when an maxItems is increased', async () => {
            const sourceSchema: JsonSchema = {
                maxItems: 10,
                type: 'array'
            };
            const destinationSchema: JsonSchema = {
                maxItems: 15,
                type: 'array'
            };

            const diffResult = await invokeDiff(sourceSchema, destinationSchema);

            const allArraysWithAtLeastElevenAndAtMostFifteenItems: JsonSchema = {
                maxItems: 15,
                minItems: 11,
                type: ['array']
            };
            expect(diffResult.addedJsonSchema).toEqual(allArraysWithAtLeastElevenAndAtMostFifteenItems);
            expect(diffResult.removedJsonSchema).toEqual(false);
        });
    });

    describe('items + minItems', () => {
        it('should find a remove difference if items schema is constrained but minItems remains the same', async () => {
            const sourceSchema: JsonSchema = {
                items: {type: ['string', 'number']},
                minItems: 2,
                type: 'array'
            };
            const destinationSchema: JsonSchema = {
                items: {type: 'string'},
                minItems: 2,
                type: 'array'
            };

            const diffResult = await invokeDiff(sourceSchema, destinationSchema);

            const arraysOfTypeNumberWithAtLeastTwoItems: JsonSchema = {
                items: {type: ['number']},
                minItems: 2,
                type: ['array']
            };
            expect(diffResult.addedJsonSchema).toEqual(false);
            expect(diffResult.removedJsonSchema).toEqual(arraysOfTypeNumberWithAtLeastTwoItems);
        });

        it('should consider a contradiction to be equivalent to a schema accepting nothing', async () => {
            const sourceSchema: JsonSchema = {
                items: false,
                minItems: 1,
                type: 'array'
            };

            const destinationSchema: JsonSchema = false;

            const diffResult = await invokeDiff(sourceSchema, destinationSchema);

            expect(diffResult.addedJsonSchema).toEqual(false);
            expect(diffResult.removedJsonSchema).toEqual(false);
        });

        it('should find added differences when a contradiction is removed', async () => {
            const sourceSchema: JsonSchema = {
                items: false,
                minItems: 1,
                type: 'array'
            };

            const destinationSchema: JsonSchema = {
                items: false,
                type: 'array'
            };

            const diffResult = await invokeDiff(sourceSchema, destinationSchema);

            const allArraysWithNoItems: JsonSchema = {
                items: false,
                type: ['array']
            };
            expect(diffResult.addedJsonSchema).toEqual(allArraysWithNoItems);
            expect(diffResult.removedJsonSchema).toEqual(false);
        });
    });

    describe('items + maxItems', () => {
        it('should not find a difference when comparing different ways of representing empty arrays', async () => {
            const sourceSchema: JsonSchema = {
                maxItems: 0,
                type: 'array'
            };
            const destinationSchema: JsonSchema = {
                items: false,
                type: 'array'
            };

            const diffResult = await invokeDiff(sourceSchema, destinationSchema);

            expect(diffResult.addedJsonSchema).toEqual(false);
            expect(diffResult.removedJsonSchema).toEqual(false);
        });
    });

    describe('minItems + maxItems', () => {
        it('should find two sets of added differences when an item range is expanded', async () => {
            const sourceSchema: JsonSchema = {
                maxItems: 10,
                minItems: 5,
                type: 'array'
            };
            const destinationSchema: JsonSchema = {
                maxItems: 15,
                minItems: 1,
                type: 'array'
            };

            const diffResult = await invokeDiff(sourceSchema, destinationSchema);

            const allArraysOfLengthOneToFourOrElevenToFifteen: JsonSchema = {
                anyOf: [
                    {
                        maxItems: 4,
                        minItems: 1,
                        type: ['array']
                    },
                    {
                        maxItems: 15,
                        minItems: 11,
                        type: ['array']
                    }
                ]
            };
            expect(diffResult.addedJsonSchema).toEqual(allArraysOfLengthOneToFourOrElevenToFifteen);
            expect(diffResult.removedJsonSchema).toEqual(false);
        });
    });

    describe('items + minItems + maxItems', () => {
        it('should find three sets of added differences when an item range and schema is expanded', async () => {
            const sourceSchema: JsonSchema = {
                items: {
                    type: ['array', 'boolean', 'integer', 'null', 'number', 'object']
                },
                maxItems: 10,
                minItems: 5,
                type: 'array'
            };
            const destinationSchema: JsonSchema = {
                maxItems: 15,
                minItems: 1,
                type: 'array'
            };

            const diffResult = await invokeDiff(sourceSchema, destinationSchema);

            const allArraysWithLengthOneToFour: JsonSchema = {
                maxItems: 4,
                minItems: 1,
                type: ['array']
            };
            const allArraysWithLengthElevenToFifteen: JsonSchema = {
                maxItems: 15,
                minItems: 11,
                type: ['array']
            };
            const allArraysOfTypeStringWithLengthFiveToTen: JsonSchema = {
                items: {
                    type: ['string']
                },
                maxItems: 15,
                minItems: 1,
                type: ['array']
            };
            const allArraysMatchingConstraints: JsonSchema = {
                anyOf: [
                    allArraysOfTypeStringWithLengthFiveToTen,
                    allArraysWithLengthOneToFour,
                    allArraysWithLengthElevenToFifteen
                ]
            };
            expect(diffResult.addedJsonSchema).toEqual(allArraysMatchingConstraints);
            expect(diffResult.removedJsonSchema).toEqual(false);
        });
    });
});
