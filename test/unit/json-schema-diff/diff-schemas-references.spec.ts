import {JsonSchema} from 'json-schema-spec-types';
import {allTypes} from '../support/all-types';
import {invokeDiff, invokeDiffAndExpectToFail} from '../support/invoke-diff';

describe('diff-schemas references', () => {
    it('should follow references in source schema when detecting differences', async () => {
        const sourceSchema: JsonSchema = {
            definitions: {
                basic_type: {
                    type: 'string'
                }
            },
            properties: {
                id: {
                    $ref: '#/definitions/basic_type'
                }
            },
            type: 'object'
        };
        const destinationSchema: JsonSchema = {
            properties: {
                id: {
                    type: 'number'
                }
            },
            type: 'object'
        };

        const diffResult = await invokeDiff(sourceSchema, destinationSchema);

        const allObjectsWithPropertyIdOfTypeNumber: JsonSchema = {
            additionalProperties: allTypes,
            properties: {
                id: {type: ['number']}
            },
            required: ['id'],
            type: ['object']
        };
        const allObjectsWithPropertyIdOfTypeString: JsonSchema = {
            additionalProperties: allTypes,
            properties: {
                id: {type: ['string']}
            },
            required: ['id'],
            type: ['object']
        };
        expect(diffResult.addedJsonSchema).toEqual(allObjectsWithPropertyIdOfTypeNumber);
        expect(diffResult.removedJsonSchema).toEqual(allObjectsWithPropertyIdOfTypeString);
    });

    it('should follow references in destination schema when detecting differences', async () => {
        const sourceSchema: JsonSchema = {
            properties: {
                id: {
                    type: 'string'
                }
            },
            type: 'object'
        };
        const destinationSchema: JsonSchema = {
            definitions: {
                basic_type: {
                    type: 'number'
                }
            },
            properties: {
                id: {
                    $ref: '#/definitions/basic_type'
                }
            },
            type: 'object'
        };

        const diffResult = await invokeDiff(sourceSchema, destinationSchema);

        const allObjectsWithPropertyIdOfTypeNumber: JsonSchema = {
            additionalProperties: allTypes,
            properties: {
                id: {type: ['number']}
            },
            required: ['id'],
            type: ['object']
        };
        const allObjectsWithPropertyIdOfTypeString: JsonSchema = {
            additionalProperties: allTypes,
            properties: {
                id: {type: ['string']}
            },
            required: ['id'],
            type: ['object']
        };
        expect(diffResult.addedJsonSchema).toEqual(allObjectsWithPropertyIdOfTypeNumber);
        expect(diffResult.removedJsonSchema).toEqual(allObjectsWithPropertyIdOfTypeString);
    });

    it('should follow nested references', async () => {
        const sourceSchema: JsonSchema = {
            definitions: {
                basic_object: {
                    properties: {
                        content: {
                            $ref: '#/definitions/basic_type'
                        }
                    },
                    type: 'object'
                },
                basic_type: {
                    type: 'string'
                }
            },
            properties: {
                id: {
                    $ref: '#/definitions/basic_object'
                }
            },
            type: 'object'
        };
        const destinationSchema: JsonSchema = {
            definitions: {
                basic_object: {
                    properties: {
                        content: {
                            $ref: '#/definitions/basic_type'
                        }
                    },
                    type: 'object'
                },
                basic_type: {
                    type: 'number'
                }
            },
            properties: {
                id: {
                    $ref: '#/definitions/basic_object'
                }
            },
            type: 'object'
        };

        const diffResult = await invokeDiff(sourceSchema, destinationSchema);

        const allObjectsWithPropertyContentOfTypeString: JsonSchema = {
            additionalProperties: allTypes,
            properties: {
                id: {
                    additionalProperties: allTypes,
                    properties: {
                        content: {type: ['number']}
                    },
                    required: ['content'],
                    type: ['object']
                }
            },
            required: ['id'],
            type: ['object']
        };
        const allObjectsWithPropertyContentOfTypeNumber: JsonSchema = {
            additionalProperties: allTypes,
            properties: {
                id: {
                    additionalProperties: allTypes,
                    properties: {
                        content: {type: ['string']}
                    },
                    required: ['content'],
                    type: ['object']
                }
            },
            required: ['id'],
            type: ['object']
        };
        expect(diffResult.addedJsonSchema).toEqual(allObjectsWithPropertyContentOfTypeString);
        expect(diffResult.removedJsonSchema).toEqual(allObjectsWithPropertyContentOfTypeNumber);
    });

    it('should fail when schema contains circular references', async () => {
        const schemaWithCircularReferences: JsonSchema = {
            additionalProperties: {
                $ref: '#/definitions/aDefinition'
            },
            definitions: {
                aDefinition: {
                    additionalProperties: {
                        $ref: '#/definitions/aDefinition'
                    },
                    type: 'object'
                }
            },
            type: 'object'
        };

        const error = await invokeDiffAndExpectToFail(schemaWithCircularReferences, {});

        expect(error.message).toContain('Circular $ref pointer found');
    });
});
