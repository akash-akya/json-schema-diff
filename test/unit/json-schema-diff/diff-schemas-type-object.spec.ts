import {JsonSchema, SimpleTypes} from 'json-schema-spec-types';
import {allTypes} from '../support/all-types';
import {invokeDiff} from '../support/invoke-diff';

describe('diff-schemas type object', () => {
    it('should find a difference between schemas with boolean additional properties', async () => {
        const sourceSchema: JsonSchema = {
            additionalProperties: true,
            type: 'object'
        };
        const destinationSchema: JsonSchema = {
            additionalProperties: false,
            type: 'object'
        };

        const diffResult = await invokeDiff(sourceSchema, destinationSchema);

        const allObjectsWithAtLeastOneProperty: JsonSchema = {
            additionalProperties: allTypes,
            minProperties: 1,
            type: ['object']
        };
        expect(diffResult.addedJsonSchema).toEqual(false);
        expect(diffResult.removedJsonSchema).toEqual(allObjectsWithAtLeastOneProperty);
    });

    it('should infer that all objects are supported when no constraints are applied by properties', async () => {
        const sourceSchema: JsonSchema = {
            properties: {
                name: true
            },
            type: 'object'
        };
        const destinationSchema: JsonSchema = {
            additionalProperties: false,
            type: 'object'
        };

        const diffResult = await invokeDiff(sourceSchema, destinationSchema);

        const allObjectsWithAtLeastOneProperty: JsonSchema = {
            additionalProperties: allTypes,
            minProperties: 1,
            type: ['object']
        };
        expect(diffResult.addedJsonSchema).toEqual(false);
        expect(diffResult.removedJsonSchema).toEqual(allObjectsWithAtLeastOneProperty);
    });

    it('should not infer that all objects are supported when constraints are applied by some properties', async () => {
        const sourceSchema: JsonSchema = {
            properties: {
                first: true,
                last: false
            },
            type: 'object'
        };
        const destinationSchema: JsonSchema = {
            additionalProperties: true,
            type: 'object'
        };

        const diffResult = await invokeDiff(sourceSchema, destinationSchema);

        const allObjectsWithRequiredLastProperty: JsonSchema = {
            additionalProperties: allTypes,
            properties: {
                last: allTypes
            },
            required: ['last'],
            type: ['object']
        };
        expect(diffResult.addedJsonSchema).toEqual(allObjectsWithRequiredLastProperty);
        expect(diffResult.removedJsonSchema).toEqual(false);
    });

    it('should infer empty object set when required contradicts properties', async () => {
        const sourceSchema: JsonSchema = {
            additionalProperties: false,
            properties: {
                name: false
            },
            required: ['name'],
            type: 'object'
        };
        const destinationSchema: JsonSchema = {
            additionalProperties: true,
            type: 'object'
        };

        const diffResult = await invokeDiff(sourceSchema, destinationSchema);

        const allObjects: JsonSchema = {type: ['object']};
        expect(diffResult.addedJsonSchema).toEqual(allObjects);
        expect(diffResult.removedJsonSchema).toEqual(false);
    });

    it('should find an add and a remove differences when changing properties type', async () => {
        const sourceSchema: JsonSchema = {
            properties: {
                name: {type: 'array'}
            },
            type: 'object'
        };
        const destinationSchema: JsonSchema = {
            properties: {
                name: {type: 'string'}
            },
            type: 'object'
        };

        const diffResult = await invokeDiff(sourceSchema, destinationSchema);

        const allObjectsWithRequiredStringName: JsonSchema = {
            additionalProperties: allTypes,
            properties: {
                name: {type: ['string']}
            },
            required: ['name'],
            type: ['object']
        };
        const allObjectsWithRequiredArrayName: JsonSchema = {
            additionalProperties: allTypes,
            properties: {
                name: {type: ['array']}
            },
            required: ['name'],
            type: ['object']
        };
        expect(diffResult.addedJsonSchema).toEqual(allObjectsWithRequiredStringName);
        expect(diffResult.removedJsonSchema).toEqual(allObjectsWithRequiredArrayName);
    });

    it('should find no differences when a property matching additionalProperties is removed', async () => {
        const sourceSchema: JsonSchema = {
            additionalProperties: {type: 'string'},
            properties: {
                name: {type: 'string'}
            },
            type: 'object'
        };
        const destinationSchema: JsonSchema = {
            additionalProperties: {type: 'string'},
            type: 'object'
        };

        const diffResult = await invokeDiff(sourceSchema, destinationSchema);

        expect(diffResult.addedJsonSchema).toEqual(false);
        expect(diffResult.removedJsonSchema).toEqual(false);
    });

    it('should find differences between schemas with properties and additionalProperties', async () => {
        const allTypesButNull: SimpleTypes[] = ['object', 'string', 'array', 'integer', 'number', 'boolean'];
        const sourceSchema: JsonSchema = {
            additionalProperties: true,
            type: 'object'
        };
        const destinationSchema: JsonSchema = {
            additionalProperties: true,
            properties: {
                name: {
                    type: allTypesButNull
                }
            },
            type: 'object'
        };

        const diffResult = await invokeDiff(sourceSchema, destinationSchema);

        const allObjectsWithRequiredNullName: JsonSchema = {
            additionalProperties: allTypes,
            properties: {
                name: {type: ['null']}
            },
            required: ['name'],
            type: ['object']
        };
        expect(diffResult.addedJsonSchema).toEqual(false);
        expect(diffResult.removedJsonSchema).toEqual(allObjectsWithRequiredNullName);
    });

    it('should find differences between schemas with properties and non boolean additionalProperties', async () => {
        const sourceSchema: JsonSchema = {
            additionalProperties: {type: ['string', 'number']},
            type: 'object'
        };
        const destinationSchema: JsonSchema = {
            additionalProperties: {type: ['string', 'number']},
            properties: {
                name: {
                    type: 'string'
                }
            },
            type: 'object'
        };

        const diffResult = await invokeDiff(sourceSchema, destinationSchema);

        const allObjectsWithRequiredNumberNameAndStringOrNumberAdditionalProperties: JsonSchema = {
            additionalProperties: {type: ['number', 'string']},
            properties: {
                name: {type: ['number']}
            },
            required: ['name'],
            type: ['object']
        };
        expect(diffResult.addedJsonSchema).toEqual(false);
        expect(diffResult.removedJsonSchema)
            .toEqual(allObjectsWithRequiredNumberNameAndStringOrNumberAdditionalProperties);
    });

    it('should find differences in schemas with boolean additionalProperties and optional properties', async () => {
        const sourceSchema: JsonSchema = {
            additionalProperties: true,
            properties: {
                name: {type: 'string'}
            },
            type: ['object']
        };
        const destinationSchema: JsonSchema = {
            additionalProperties: false,
            properties: {
                name: {type: 'string'}
            },
            type: ['object']
        };

        const diffResult = await invokeDiff(sourceSchema, destinationSchema);

        const allObjectsWithNoNameAndAtLeastOneProperty: JsonSchema = {
            additionalProperties: allTypes,
            minProperties: 1,
            properties: {
                name: false
            },
            type: ['object']
        };
        const allObjectsWithRequiredStringNameAndAtLeastAnotherProperty: JsonSchema = {
            additionalProperties: allTypes,
            minProperties: 2,
            properties: {
                name: {
                    type: ['string']
                }
            },
            required: ['name'],
            type: ['object']
        };
        expect(diffResult.addedJsonSchema).toEqual(false);
        expect(diffResult.removedJsonSchema).toEqual({
            anyOf: [
                allObjectsWithNoNameAndAtLeastOneProperty,
                allObjectsWithRequiredStringNameAndAtLeastAnotherProperty
            ]
        });
    });

    it('should add numbers into the anyOf when the object differences result in an anyOf', async () => {
        const sourceSchema: JsonSchema = {
            additionalProperties: true,
            properties: {
                name: {type: 'string'}
            },
            type: ['object', 'number']
        };
        const destinationSchema: JsonSchema = {
            additionalProperties: false,
            properties: {
                name: {type: 'string'}
            },
            type: ['object']
        };

        const diffResult = await invokeDiff(sourceSchema, destinationSchema);

        const allObjectsWithNoNameAndAtLeastOneProperty: JsonSchema = {
            additionalProperties: allTypes,
            minProperties: 1,
            properties: {
                name: false
            },
            type: ['object']
        };
        const allObjectsWithRequiredStringNameAndAtLeastAnotherProperty: JsonSchema = {
            additionalProperties: allTypes,
            minProperties: 2,
            properties: {
                name: {
                    type: ['string']
                }
            },
            required: ['name'],
            type: ['object']
        };
        const allNumbers: JsonSchema = {type: ['number']};
        expect(diffResult.addedJsonSchema).toEqual(false);
        expect(diffResult.removedJsonSchema).toEqual({
            anyOf: [
                allObjectsWithNoNameAndAtLeastOneProperty,
                allObjectsWithRequiredStringNameAndAtLeastAnotherProperty,
                allNumbers
            ]
        });
    });

    describe('required properties', () => {
        it('should find a difference between schemas with required property completely removed', async () => {
            const sourceSchema: JsonSchema = {
                required: ['first'],
                type: 'object'
            };
            const destinationSchema: JsonSchema = {type: 'object'};

            const diffResult = await invokeDiff(sourceSchema, destinationSchema);

            const allObjectsWithNoFirst: JsonSchema = {
                additionalProperties: allTypes,
                properties: {
                    first: false
                },
                type: ['object']
            };
            expect(diffResult.addedJsonSchema).toEqual(allObjectsWithNoFirst);
            expect(diffResult.removedJsonSchema).toEqual(false);
        });

        it('should find a difference between schemas with required property removed', async () => {
            const sourceSchema: JsonSchema = {
                required: ['name', 'first'],
                type: 'object'
            };
            const destinationSchema: JsonSchema = {
                required: ['name'],
                type: 'object'
            };

            const diffResult = await invokeDiff(sourceSchema, destinationSchema);

            const allObjectsWithRequiredNameAndNoFirst: JsonSchema = {
                additionalProperties: allTypes,
                properties: { first: false },
                required: ['name'],
                type: ['object']
            };
            expect(diffResult.addedJsonSchema).toEqual(allObjectsWithRequiredNameAndNoFirst);
            expect(diffResult.removedJsonSchema).toEqual(false);
        });

        it('should find differences when required property with changed schema is added', async () => {
            const sourceSchema: JsonSchema = {
                properties: {
                    first: {
                        type: ['string']
                    }
                },
                required: ['name'],
                type: 'object'
            };
            const destinationSchema: JsonSchema = {
                properties: {
                    first: {
                        type: ['array']
                    }
                },
                required: ['name', 'first'],
                type: 'object'
            };

            const diffResult = await invokeDiff(sourceSchema, destinationSchema);

            const allObjectsWithRequiredNameAndRequiredArrayFirst: JsonSchema = {
                additionalProperties: allTypes,
                properties: {
                    first: {type: ['array']}
                },
                required: ['name', 'first'],
                type: ['object']
            };

            const allObjectsWithRequiredNameAndRequiredStringFirst: JsonSchema = {
                additionalProperties: allTypes,
                properties: {
                    first: {type: ['string']}
                },
                required: ['name'],
                type: ['object']
            };
            expect(diffResult.addedJsonSchema).toEqual(allObjectsWithRequiredNameAndRequiredArrayFirst);
            expect(diffResult.removedJsonSchema).toEqual(allObjectsWithRequiredNameAndRequiredStringFirst);
        });
    });
});
