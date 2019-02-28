import {JsonSchema} from 'json-schema-spec-types';
import {invokeDiff, invokeDiffAndExpectToFail} from '../support/invoke-diff';

describe('diff-schemas', () => {
    describe('validation', () => {
        it('should return an error when the source schema is not valid', async () => {
            const sourceSchema: JsonSchema = {type: 'invalid-type'} as any;
            const destinationsSchema: JsonSchema = {type: 'string'};

            const error = await invokeDiffAndExpectToFail(sourceSchema, destinationsSchema);

            expect(error).toEqual(new Error(
                'Source schema is not a valid json schema: ' +
                'data.type should be equal to one of the allowed values, ' +
                'data.type should be array, data.type should match some schema in anyOf'
            ));
        });

        it('should return an error when the destination schema is not valid', async () => {
            const sourceSchema: JsonSchema = {type: 'string'};
            const destinationsSchema: JsonSchema = {type: 'invalid-type'} as any;

            const error = await invokeDiffAndExpectToFail(sourceSchema, destinationsSchema);

            expect(error).toEqual(new Error(
                'Destination schema is not a valid json schema: ' +
                'data.type should be equal to one of the allowed values, ' +
                'data.type should be array, data.type should match some schema in anyOf'
            ));
        });

        it('should dereference schemas before validating', async () => {
            const schemaWithInvalidReference: JsonSchema = {
                components: {
                    schemas: {
                        numberSchema: {
                            exclusiveMinimum: false,
                            type: 'number'
                        }
                    }
                },
                properties: {
                    numberProperty: {
                        $ref: '#/components/schemas/numberSchema'
                    }
                },
                type: 'number'
            };

            const error = await invokeDiffAndExpectToFail(schemaWithInvalidReference, schemaWithInvalidReference);

            expect(error).toEqual(new Error(
                'Source schema is not a valid json schema: ' +
                'data.properties[\'numberProperty\'].exclusiveMinimum should be number'
            ));
        });
    });

    describe('additionsFound and removalsFound', () => {
        it('should return no additions or removals found', async () => {
            const sourceSchema: JsonSchema = {type: 'string'};
            const destinationsSchema: JsonSchema = {type: 'string'};

            const diffResult = await invokeDiff(sourceSchema, destinationsSchema);

            expect(diffResult.additionsFound).toEqual(false);
            expect(diffResult.removalsFound).toEqual(false);
        });

        it('should return additions and removals found', async () => {
            const sourceSchema: JsonSchema = {type: 'string'};
            const destinationsSchema: JsonSchema = {type: 'number'};

            const diffResult = await invokeDiff(sourceSchema, destinationsSchema);

            expect(diffResult.additionsFound).toEqual(true);
            expect(diffResult.removalsFound).toEqual(true);
        });
    });
});
