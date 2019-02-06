import {JsonSchema} from 'json-schema-spec-types';
import * as JsonSchemaDiff from '../../lib/api';
import {DiffResult} from '../../lib/api-types';
import {expectToFail} from '../support/expect-to-fail';

describe('api', () => {
    const whenSourceAndDestinationSchemasAreDiffed = (sourceSchema: any, destinationSchema: any): Promise<DiffResult> =>
        JsonSchemaDiff.diffSchemas({sourceSchema, destinationSchema});

    describe('input types', () => {
        it('should accept a source and destination schema as input', async () => {
            const jsonSchemaDiffOptions = {
                destinationSchema: {},
                sourceSchema: {}
            };

            await JsonSchemaDiff.diffSchemas(jsonSchemaDiffOptions);
        });
    });

    describe('output types', () => {
        it('should throw error when schemas cant be diffed', async () => {
            const sourceSchema = {not: 'a valid json schema'};
            const destinationSchema = {};

            const error = await expectToFail(whenSourceAndDestinationSchemasAreDiffed(sourceSchema, destinationSchema));

            expect(error.message).toEqual(jasmine.stringMatching('Source schema is not a valid json schema'));
        });

        it('should return an added result according to the defined public types', async () => {
            const sourceSchema: JsonSchema = {type: 'string'};
            const destinationSchema: JsonSchema = {type: ['string', 'number']};

            const result = await whenSourceAndDestinationSchemasAreDiffed(sourceSchema, destinationSchema);
            const resultWithoutTypes = result as any;

            expect(resultWithoutTypes).toEqual({
                addedJsonSchema: {
                    'type': [ jasmine.any(String) ],
                    'x-destination-origins': [
                        {
                            path: [ jasmine.any(String) ],
                            value: [ jasmine.any(String), jasmine.any(String) ]
                        }
                    ],
                    'x-source-origins': [
                        {
                            path: [ jasmine.any(String) ],
                            value: jasmine.any(String)
                        }
                    ]
                },
                additionsFound: jasmine.any(Boolean),
                removalsFound: jasmine.any(Boolean),
                removedJsonSchema: jasmine.any(Boolean)
            });
        });

        it('should return a removed result according to the defined public types', async () => {
            const sourceSchema: JsonSchema = {type: ['string', 'number']};
            const destinationSchema: JsonSchema = {type: 'string'};

            const result = await whenSourceAndDestinationSchemasAreDiffed(sourceSchema, destinationSchema);
            const resultWithoutTypes = result as any;

            expect(resultWithoutTypes).toEqual({
                addedJsonSchema: jasmine.any(Boolean),
                additionsFound: jasmine.any(Boolean),
                removalsFound: jasmine.any(Boolean),
                removedJsonSchema: {
                    'type': [ jasmine.any(String) ],
                    'x-destination-origins': [
                        {
                            path: [ jasmine.any(String) ],
                            value: jasmine.any(String)
                        }
                    ],
                    'x-source-origins': [
                        {
                            path: [ jasmine.any(String) ],
                            value: [ jasmine.any(String), jasmine.any(String) ]
                        }
                    ]
                }
            });
        });

    });
});
