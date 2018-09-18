import {JsonSchema, SimpleTypes} from 'json-schema-spec-types';
import {CoreDiffJsonSchema} from '../../../lib/json-schema-diff/differ/parser/json-set/diff-json-schema';
import {diffJsonSchemaBuilder} from '../support/builders/diff-json-schema-builder';
import {diffResultOriginsBuilder} from '../support/builders/diff-result-origins-builder';
import {invokeDiff, invokeDiffAndExpectToFail} from '../support/invoke-diff';

const allTypesSchema: CoreDiffJsonSchema = {
    type: ['array', 'boolean', 'integer', 'null', 'number', 'object', 'string']
};

describe('differ', () => {
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

    describe('type', () => {
        it('should find no differences when the schemas are the same', async () => {
            const sourceSchema: JsonSchema = {type: 'string'};
            const destinationsSchema: JsonSchema = {type: 'string'};

            const diffResult = await invokeDiff(sourceSchema, destinationsSchema);

            expect(diffResult.addedJsonSchema).toEqual(false);
            expect(diffResult.removedJsonSchema).toEqual(false);
        });

        it('should find no differences when the schemas are equivalent', async () => {
            const sourceSchema: JsonSchema = {type: 'string'};
            const destinationsSchema: JsonSchema = {type: ['string']};

            const diffResult = await invokeDiff(sourceSchema, destinationsSchema);

            expect(diffResult.addedJsonSchema).toEqual(false);
            expect(diffResult.removedJsonSchema).toEqual(false);
        });

        it('should find a remove type difference when a type is removed', async () => {
            const sourceSchema: JsonSchema = {type: ['string', 'number']};
            const destinationsSchema: JsonSchema = {type: ['string']};

            const diffResult = await invokeDiff(sourceSchema, destinationsSchema);

            expect(diffResult.addedJsonSchema).toEqual(false);
            expect(diffResult.removedJsonSchema).toEqual(diffJsonSchemaBuilder
                .withSchema({type: ['number']})
                .withDestinationOrigins([diffResultOriginsBuilder
                    .withPath(['type'])
                    .withValue(['string'])])
                .withSourceOrigins([diffResultOriginsBuilder
                    .withPath(['type'])
                    .withValue(['string', 'number'])])
                .build());
        });

        it('should find an add type difference when an array is added', async () => {
            const sourceSchema: JsonSchema = {type: 'number'};
            const destinationsSchema: JsonSchema = {type: ['number', 'array']};

            const diffResult = await invokeDiff(sourceSchema, destinationsSchema);

            expect(diffResult.addedJsonSchema).toEqual(diffJsonSchemaBuilder
                .withSchema({type: ['array']})
                .withDestinationOrigins([diffResultOriginsBuilder
                    .withPath(['type'])
                    .withValue(['number', 'array'])])
                .withSourceOrigins([diffResultOriginsBuilder
                    .withPath(['type'])
                    .withValue('number')])
                .build());
            expect(diffResult.removedJsonSchema).toEqual(false);
        });

        it('should find an add type difference when a boolean is added', async () => {
            const sourceSchema: JsonSchema = {type: 'number'};
            const destinationsSchema: JsonSchema = {type: ['number', 'boolean']};

            const diffResult = await invokeDiff(sourceSchema, destinationsSchema);

            expect(diffResult.addedJsonSchema).toEqual(diffJsonSchemaBuilder
                .withSchema({type: ['boolean']})
                .withDestinationOrigins([diffResultOriginsBuilder
                    .withPath(['type'])
                    .withValue(['number', 'boolean'])])
                .withSourceOrigins([diffResultOriginsBuilder
                    .withPath(['type'])
                    .withValue('number')])
                .build());
            expect(diffResult.removedJsonSchema).toEqual(false);
        });

        it('should find an add type difference when an integer is added', async () => {
            const sourceSchema: JsonSchema = {type: 'number'};
            const destinationsSchema: JsonSchema = {type: ['number', 'integer']};

            const diffResult = await invokeDiff(sourceSchema, destinationsSchema);

            expect(diffResult.addedJsonSchema).toEqual(diffJsonSchemaBuilder
                .withSchema({type: ['integer']})
                .withDestinationOrigins([diffResultOriginsBuilder
                    .withPath(['type'])
                    .withValue(['number', 'integer'])])
                .withSourceOrigins([diffResultOriginsBuilder
                    .withPath(['type'])
                    .withValue('number')])
                .build());
            expect(diffResult.removedJsonSchema).toEqual(false);
        });

        it('should find an add type difference when a null is added', async () => {
            const sourceSchema: JsonSchema = {type: 'number'};
            const destinationsSchema: JsonSchema = {type: ['number', 'null']};

            const diffResult = await invokeDiff(sourceSchema, destinationsSchema);

            expect(diffResult.addedJsonSchema).toEqual(diffJsonSchemaBuilder
                .withSchema({type: ['null']})
                .withDestinationOrigins([diffResultOriginsBuilder
                    .withPath(['type'])
                    .withValue(['number', 'null'])])
                .withSourceOrigins([diffResultOriginsBuilder
                    .withPath(['type'])
                    .withValue('number')])
                .build());
            expect(diffResult.removedJsonSchema).toEqual(false);
        });

        it('should find an add type difference when a number is added', async () => {
            const sourceSchema: JsonSchema = {type: 'string'};
            const destinationsSchema: JsonSchema = {type: ['string', 'number']};

            const diffResult = await invokeDiff(sourceSchema, destinationsSchema);

            expect(diffResult.addedJsonSchema).toEqual(diffJsonSchemaBuilder
                .withSchema({type: ['number']})
                .withDestinationOrigins([diffResultOriginsBuilder
                    .withPath(['type'])
                    .withValue(['string', 'number'])])
                .withSourceOrigins([diffResultOriginsBuilder
                    .withPath(['type'])
                    .withValue('string')])
                .build());
            expect(diffResult.removedJsonSchema).toEqual(false);
        });

        it('should find an add type difference when an object is added', async () => {
            const sourceSchema: JsonSchema = {type: 'number'};
            const destinationsSchema: JsonSchema = {type: ['number', 'object']};

            const diffResult = await invokeDiff(sourceSchema, destinationsSchema);

            expect(diffResult.addedJsonSchema).toEqual(diffJsonSchemaBuilder
                .withSchema({type: ['object']})
                .withDestinationOrigins([
                    diffResultOriginsBuilder
                        .withPath(['type'])
                        .withValue(['number', 'object'])
                ])
                .withSourceOrigins([diffResultOriginsBuilder
                    .withPath(['type'])
                    .withValue('number')])
                .build());
            expect(diffResult.removedJsonSchema).toEqual(false);
        });

        it('should find an add type difference when a string is added', async () => {
            const sourceSchema: JsonSchema = {type: 'number'};
            const destinationsSchema: JsonSchema = {type: ['number', 'string']};

            const diffResult = await invokeDiff(sourceSchema, destinationsSchema);

            expect(diffResult.addedJsonSchema).toEqual(diffJsonSchemaBuilder
                .withSchema({type: ['string']})
                .withDestinationOrigins([diffResultOriginsBuilder
                    .withPath(['type'])
                    .withValue(['number', 'string'])])
                .withSourceOrigins([diffResultOriginsBuilder
                    .withPath(['type'])
                    .withValue('number')])
                .build());
            expect(diffResult.removedJsonSchema).toEqual(false);
        });

        it('should find an add and remove difference when a type is changed ', async () => {
            const sourceSchema: JsonSchema = {type: 'number'};
            const destinationsSchema: JsonSchema = {type: 'string'};

            const diffResult = await invokeDiff(sourceSchema, destinationsSchema);

            const baseDiffJsonSchema = diffJsonSchemaBuilder
                .withDestinationOrigins([diffResultOriginsBuilder
                    .withPath(['type'])
                    .withValue('string')])
                .withSourceOrigins([diffResultOriginsBuilder
                    .withPath(['type'])
                    .withValue('number')]);
            expect(diffResult.addedJsonSchema).toEqual(baseDiffJsonSchema.withSchema({type: ['string']}).build());
            expect(diffResult.removedJsonSchema).toEqual(baseDiffJsonSchema.withSchema({type: ['number']}).build());
        });

        it('should find no differences when given two empty schemas', async () => {
            const sourceSchema: JsonSchema = {};
            const destinationsSchema: JsonSchema = {};

            const diffResult = await invokeDiff(sourceSchema, destinationsSchema);

            expect(diffResult.addedJsonSchema).toEqual(false);
            expect(diffResult.removedJsonSchema).toEqual(false);
        });

        it('should find multiple differences when multiple types are removed', async () => {
            const sourceSchema: JsonSchema = {type: ['number', 'string', 'boolean']};
            const destinationsSchema: JsonSchema = {type: ['number']};

            const diffResult = await invokeDiff(sourceSchema, destinationsSchema);

            expect(diffResult.addedJsonSchema).toEqual(false);
            expect(diffResult.removedJsonSchema).toEqual(diffJsonSchemaBuilder
                .withSchema({type: ['boolean', 'string']})
                .withDestinationOrigins([diffResultOriginsBuilder
                    .withPath(['type'])
                    .withValue(['number'])])
                .withSourceOrigins([diffResultOriginsBuilder
                    .withPath(['type'])
                    .withValue(['number', 'string', 'boolean'])])
                .build());
        });

        it('should find multiple differences when multiple types are added', async () => {
            const sourceSchema: JsonSchema = {type: ['number']};
            const destinationsSchema: JsonSchema = {type: ['number', 'string', 'boolean']};

            const diffResult = await invokeDiff(sourceSchema, destinationsSchema);

            expect(diffResult.addedJsonSchema).toEqual(diffJsonSchemaBuilder
                .withSchema({type: ['boolean', 'string']})
                .withSourceOrigins([diffResultOriginsBuilder
                    .withPath(['type'])
                    .withValue(['number'])])
                .withDestinationOrigins([diffResultOriginsBuilder
                    .withPath(['type'])
                    .withValue(['number', 'string', 'boolean'])])
                .build());
            expect(diffResult.removedJsonSchema).toEqual(false);
        });

        it('should find removed differences when there was no type and now there is', async () => {
            const sourceSchema: JsonSchema = {};
            const destinationsSchema: JsonSchema = {type: ['integer', 'number', 'object', 'null', 'boolean', 'array']};

            const diffResult = await invokeDiff(sourceSchema, destinationsSchema);

            expect(diffResult.addedJsonSchema).toEqual(false);
            expect(diffResult.removedJsonSchema).toEqual(diffJsonSchemaBuilder
                .withSchema({type: ['string']})
                .withDestinationOrigins([diffResultOriginsBuilder
                    .withPath(['type'])
                    .withValue(['integer', 'number', 'object', 'null', 'boolean', 'array'])])
                .build());
        });
    });

    describe('schema as boolean', () => {
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

            expect(diffResult.addedJsonSchema).toEqual(diffJsonSchemaBuilder
                .withSchema(allTypesSchema)
                .withDestinationOrigins([diffResultOriginsBuilder.withPath([]).withValue(true)])
                .withSourceOrigins([diffResultOriginsBuilder.withPath([]).withValue(false)])
                .build());
            expect(diffResult.removedJsonSchema).toEqual(false);
        });

        it('should find an add difference when schema is changed to true from all but one type', async () => {
            const allTypesButObject: SimpleTypes[] = ['string', 'array', 'number', 'integer', 'boolean', 'null'];
            const sourceSchema: JsonSchema = {
                type: allTypesButObject
            };
            const destinationSchema: JsonSchema = true;

            const diffResult = await invokeDiff(sourceSchema, destinationSchema);

            expect(diffResult.addedJsonSchema).toEqual(diffJsonSchemaBuilder
                .withSchema({
                    type: ['object']
                })
                .withDestinationOrigins([diffResultOriginsBuilder.withValue(true).withPath([])])
                .withSourceOrigins([diffResultOriginsBuilder
                    .withPath(['type'])
                    .withValue(['string', 'array', 'number', 'integer', 'boolean', 'null'])])
                .build());
            expect(diffResult.removedJsonSchema).toEqual(false);
        });

        it('should find a remove difference when schema is changed to false', async () => {
            const sourceSchema: JsonSchema = {type: 'string'};
            const destinationSchema: JsonSchema = false;

            const diffResult = await invokeDiff(sourceSchema, destinationSchema);

            expect(diffResult.addedJsonSchema).toEqual(false);
            expect(diffResult.removedJsonSchema).toEqual(diffJsonSchemaBuilder
                .withSchema({
                    type: ['string']
                })
                .withDestinationOrigins([diffResultOriginsBuilder.withValue(false).withPath([])])
                .withSourceOrigins([diffResultOriginsBuilder
                    .withPath(['type'])
                    .withValue('string')])
                .build());
        });

        it('should find an add difference when schema is changed from false to some type', async () => {
            const sourceSchema: JsonSchema = false;
            const destinationSchema: JsonSchema = {type: 'string'};

            const diffResult = await invokeDiff(sourceSchema, destinationSchema);

            expect(diffResult.addedJsonSchema).toEqual(diffJsonSchemaBuilder
                .withSchema({
                    type: ['string']
                })
                .withSourceOrigins([diffResultOriginsBuilder.withValue(false).withPath([])])
                .withDestinationOrigins([diffResultOriginsBuilder
                    .withPath(['type'])
                    .withValue('string')])
                .build());
            expect(diffResult.removedJsonSchema).toEqual(false);
        });
    });

    describe('object type', () => {
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

            const allObjectsWithAtLeastOnePropertyOfAnyType = diffJsonSchemaBuilder
                .withSchema({
                    additionalProperties:
                        diffJsonSchemaBuilder
                            .withSchema(allTypesSchema)
                            .withDestinationOrigins([diffResultOriginsBuilder
                                .withPath(['additionalProperties'])
                                .withValue(false)])
                            .withSourceOrigins([diffResultOriginsBuilder
                                .withPath(['additionalProperties'])
                                .withValue(true)])
                            .build(),
                    minProperties: 1,
                    type: ['object']
                })
                .build();
            expect(diffResult.addedJsonSchema).toEqual(false);
            expect(diffResult.removedJsonSchema).toEqual(allObjectsWithAtLeastOnePropertyOfAnyType);
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

            const allObjectsWithAtLeastOneProperty = diffJsonSchemaBuilder
                .withSchema({
                    additionalProperties:
                        diffJsonSchemaBuilder
                            .withSchema(allTypesSchema)
                            .withDestinationOrigins([diffResultOriginsBuilder
                                .withPath(['additionalProperties'])
                                .withValue(false)])
                            .withSourceOrigins([
                                diffResultOriginsBuilder
                                    .withPath(['additionalProperties'])
                                    .withValue(undefined)
                            ])
                            .build(),
                    minProperties: 1,
                    type: ['object']
                })
                .build();
            expect(diffResult.addedJsonSchema).toEqual(false);
            expect(diffResult.removedJsonSchema).toEqual(allObjectsWithAtLeastOneProperty);
        });

        it('should infer that all objects are supported when no constraints are applied by properties', async () => {
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

            const allObjects = diffJsonSchemaBuilder
                .withSchema({type: ['object']})
                .withDestinationOrigins([diffResultOriginsBuilder
                    .withPath(['type'])
                    .withValue('object')])
                .withSourceOrigins([
                    diffResultOriginsBuilder
                        .withPath(['type'])
                        .withValue('object'),
                    diffResultOriginsBuilder
                        .withPath(['required'])
                        .withValue(['name'])
                ])
                .build();
            expect(diffResult.addedJsonSchema).toEqual(allObjects);
            expect(diffResult.removedJsonSchema).toEqual(false);
        });

        // TODO: add this test back in when the schema sources is gone
        xit('should ignore properties with the same schema additional properties', async () => {
            const sourceSchema: JsonSchema = {
                additionalProperties: {type: 'string'},
                properties: {
                    name: {type: 'string'}
                },
                type: 'object'
            };
            const destinationSchema: JsonSchema = {
                additionalProperties: false,
                type: 'object'
            };

            const diffResult = await invokeDiff(sourceSchema, destinationSchema);

            const allObjectsWithAtLeastOneProperty = diffJsonSchemaBuilder
                .withSchema({
                    additionalProperties:
                        diffJsonSchemaBuilder
                            .withSchema({type: ['string']})
                            .withDestinationOrigins([diffResultOriginsBuilder
                                .withPath(['additionalProperties'])
                                .withValue(false)])
                            .withSourceOrigins([
                                diffResultOriginsBuilder
                                    .withPath(['additionalProperties'])
                                    .withValue({type: 'string'})
                            ])
                            .build(),
                    minProperties: 1,
                    type: ['object']
                })
                .build();
            expect(diffResult.addedJsonSchema).toEqual(false);
            expect(diffResult.removedJsonSchema).toEqual(allObjectsWithAtLeastOneProperty);
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

            const propertiesBaseDiffJsonSchema = diffJsonSchemaBuilder
                .withSourceOrigins([
                    diffResultOriginsBuilder
                        .withValue('array')
                        .withPath(['properties', 'name', 'type'])])
                .withDestinationOrigins([
                    diffResultOriginsBuilder
                        .withValue('string')
                        .withPath(['properties', 'name', 'type'])]);

            const allObjectsWithPropertyNameOfTypeString = diffJsonSchemaBuilder
                .withSchema({
                    additionalProperties: allTypesSchema,
                    properties: {
                        name: propertiesBaseDiffJsonSchema.withSchema({type: ['string']}).build()
                    },
                    required: ['name'],
                    type: ['object']
                })
                .build();

            const allObjectsWithPropertyNameOfTypeArray = diffJsonSchemaBuilder
                .withSchema({
                    additionalProperties: allTypesSchema,
                    properties: {
                        name: propertiesBaseDiffJsonSchema.withSchema({type: ['array']}).build()
                    },
                    required: ['name'],
                    type: ['object']
                })
                .build();

            expect(diffResult.addedJsonSchema).toEqual(allObjectsWithPropertyNameOfTypeString);
            expect(diffResult.removedJsonSchema).toEqual(allObjectsWithPropertyNameOfTypeArray);
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

            const allObjectsWithPropertyNameOfTypeNull = diffJsonSchemaBuilder.withSchema({
                additionalProperties: allTypesSchema,
                properties: {
                    name: diffJsonSchemaBuilder
                        .withSchema({type: ['null']})
                        .withSourceOrigins([diffResultOriginsBuilder
                            .withPath(['additionalProperties'])
                            .withValue(true)])
                        .withDestinationOrigins([diffResultOriginsBuilder
                            .withPath(['properties', 'name', 'type'])
                            .withValue(['object', 'string', 'array', 'integer', 'number', 'boolean'])])
                        .build()
                },
                required: ['name'],
                type: ['object']
            })
            .build();
            expect(diffResult.addedJsonSchema).toEqual(false);
            expect(diffResult.removedJsonSchema).toEqual(allObjectsWithPropertyNameOfTypeNull);
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

            const objectsWithPropertyNameTypeStringAndAdditionalPropertiesAsDefined = diffJsonSchemaBuilder
            .withSchema({
                additionalProperties: {type: ['number', 'string']},
                properties: {
                    name: diffJsonSchemaBuilder
                        .withSchema({type: ['number']})
                        .withDestinationOrigins([diffResultOriginsBuilder
                            .withPath(['properties', 'name', 'type'])
                            .withValue('string')])
                        .withSourceOrigins([diffResultOriginsBuilder
                            .withPath(['additionalProperties', 'type'])
                            .withValue(['string', 'number'])])
                        .build()
                },
                required: ['name'],
                type: ['object']
            })
            .build();
            expect(diffResult.addedJsonSchema).toEqual(false);
            expect(diffResult.removedJsonSchema)
                .toEqual(objectsWithPropertyNameTypeStringAndAdditionalPropertiesAsDefined);
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

            const allObjectsWithAtLeastOnePropertyButNoName = diffJsonSchemaBuilder
                .withSchema(
                    {
                        additionalProperties:
                            diffJsonSchemaBuilder.withSchema(allTypesSchema)
                            .withDestinationOrigins([diffResultOriginsBuilder
                                .withPath(['additionalProperties'])
                                .withValue(false)])
                            .withSourceOrigins([diffResultOriginsBuilder
                                .withPath(['additionalProperties'])
                                .withValue(true)])
                            .build(),
                        minProperties: 1,
                        properties: {
                            name: false
                        },
                        type: ['object']
                    }
                ).build();
            const allObjectsWithPropertyNameOfTypeStringAndAtLeastAnotherProperty = diffJsonSchemaBuilder
                .withSchema(
                    {
                        additionalProperties:
                            diffJsonSchemaBuilder.withSchema(allTypesSchema)
                            .withDestinationOrigins([diffResultOriginsBuilder
                                .withPath(['additionalProperties'])
                                .withValue(false)])
                            .withSourceOrigins([diffResultOriginsBuilder
                                .withPath(['additionalProperties'])
                                .withValue(true)])
                            .build(),
                        minProperties: 2,
                        properties: {
                            name: {
                                type: ['string']
                            }
                        },
                        required: ['name'],
                        type: ['object']
                    }
                ).build();
            expect(diffResult.addedJsonSchema).toEqual(false);
            expect(diffResult.removedJsonSchema).toEqual(diffJsonSchemaBuilder
                .withSchema({
                    anyOf: [
                        allObjectsWithAtLeastOnePropertyButNoName,
                        allObjectsWithPropertyNameOfTypeStringAndAtLeastAnotherProperty
                    ]
                })
                .build()
            );
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

            const allObjectsWithAtLeastOnePropertyButNoName = diffJsonSchemaBuilder
                .withSchema({
                    additionalProperties:
                        diffJsonSchemaBuilder.withSchema(allTypesSchema)
                            .withDestinationOrigins([diffResultOriginsBuilder
                                .withPath(['additionalProperties'])
                                .withValue(false)])
                            .withSourceOrigins([diffResultOriginsBuilder
                                .withPath(['additionalProperties'])
                                .withValue(true)])
                            .build(),
                    minProperties: 1,
                    properties: {
                        name: false
                    },
                    type: ['object']
                })
                .withSourceOrigins([diffResultOriginsBuilder.withPath(['type']).withValue(['object', 'number'])])
                .withDestinationOrigins([diffResultOriginsBuilder.withPath(['type']).withValue(['object'])])
                .build();
            const allObjectsWithPropertyNameOfTypeString = diffJsonSchemaBuilder
                .withSchema({
                    additionalProperties:
                        diffJsonSchemaBuilder.withSchema(allTypesSchema)
                            .withDestinationOrigins([diffResultOriginsBuilder
                                .withPath(['additionalProperties'])
                                .withValue(false)])
                            .withSourceOrigins([diffResultOriginsBuilder
                                .withPath(['additionalProperties'])
                                .withValue(true)])
                            .build(),
                    minProperties: 2,
                    properties: {
                        name: {
                            type: ['string']
                        }
                    },
                    required: ['name'],
                    type: ['object']
                })
                .withSourceOrigins([diffResultOriginsBuilder.withPath(['type']).withValue(['object', 'number'])])
                .withDestinationOrigins([diffResultOriginsBuilder.withPath(['type']).withValue(['object'])])
                .build();

            const allNumbers = diffJsonSchemaBuilder
                .withSchema({type: ['number']})
                .withSourceOrigins([diffResultOriginsBuilder.withPath(['type']).withValue(['object', 'number'])])
                .withDestinationOrigins([diffResultOriginsBuilder.withPath(['type']).withValue(['object'])])
                .build();

            const diffResult = await invokeDiff(sourceSchema, destinationSchema);

            expect(diffResult.addedJsonSchema).toEqual(false);
            expect(diffResult.removedJsonSchema).toEqual(diffJsonSchemaBuilder
                .withSchema({
                    anyOf: [
                        allObjectsWithAtLeastOnePropertyButNoName,
                        allObjectsWithPropertyNameOfTypeString,
                        allNumbers
                    ]
                })
                .build()
            );
        });

        describe('required properties', () => {
            it('should find a difference between schemas with required property completely removed', async () => {
                const sourceSchema: JsonSchema = {
                    required: ['first'],
                    type: 'object'
                };
                const destinationSchema: JsonSchema = {type: 'object'};

                const diffResult = await invokeDiff(sourceSchema, destinationSchema);

                const expectedAddedJsonSchema = diffJsonSchemaBuilder
                    .withSchema({
                        additionalProperties: allTypesSchema,
                        properties: {
                            first: false
                        },
                        type: ['object']
                    })
                    .withDestinationOrigins([
                        diffResultOriginsBuilder
                            .withPath(['type'])
                            .withValue('object')
                    ])
                    .withSourceOrigins([
                        diffResultOriginsBuilder
                            .withPath(['type'])
                            .withValue('object'),
                        diffResultOriginsBuilder
                            .withPath(['required'])
                            .withValue(['first'])
                    ])
                    .build();

                expect(diffResult.addedJsonSchema).toEqual(expectedAddedJsonSchema);
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

                const allObjectsWithPropertyNameButNoFirst = diffJsonSchemaBuilder
                    .withSchema({
                        additionalProperties: allTypesSchema,
                        properties: { first: false },
                        required: ['name'],
                        type: ['object']
                    })
                    .withSourceOrigins([
                        diffResultOriginsBuilder
                            .withValue('object')
                            .withPath(['type']),
                        diffResultOriginsBuilder
                            .withValue(['name', 'first'])
                            .withPath(['required'])
                    ])
                    .withDestinationOrigins([
                        diffResultOriginsBuilder
                            .withValue('object')
                            .withPath(['type']),
                        diffResultOriginsBuilder
                            .withValue(['name'])
                            .withPath(['required'])
                    ])
                    .build();
                expect(diffResult.addedJsonSchema).toEqual(allObjectsWithPropertyNameButNoFirst);
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

                const allObjectsWithPropertyNameAndPropertyFirstOfTypeArray = diffJsonSchemaBuilder
                    .withSchema({
                        additionalProperties: allTypesSchema,
                        properties: {
                            first: diffJsonSchemaBuilder
                                .withSchema({
                                    type: ['array']
                                })
                                .withDestinationOrigins([
                                    diffResultOriginsBuilder
                                        .withValue(['array'])
                                        .withPath(['properties', 'first', 'type'])
                                ])
                                .withSourceOrigins([
                                    diffResultOriginsBuilder
                                        .withValue(['string'])
                                        .withPath(['properties', 'first', 'type'])
                                ])
                                .build()
                        },
                        required: ['name', 'first'],
                        type: ['object']
                    })
                    .withDestinationOrigins([
                        diffResultOriginsBuilder
                            .withValue('object')
                            .withPath(['type']),
                        diffResultOriginsBuilder
                            .withValue(['name', 'first'])
                            .withPath(['required'])
                    ])
                    .withSourceOrigins([
                        diffResultOriginsBuilder
                            .withValue('object')
                            .withPath(['type']),
                        diffResultOriginsBuilder
                            .withValue(['name'])
                            .withPath(['required'])
                    ])
                    .build();

                const allObjectsWithPropertyNameAndOptionalPropertyFirstOfTypeString = diffJsonSchemaBuilder
                    .withSchema({
                        additionalProperties: allTypesSchema,
                        properties: {
                            first: diffJsonSchemaBuilder
                                .withSchema({
                                    type: ['string']
                                })
                                .withDestinationOrigins([
                                    diffResultOriginsBuilder
                                        .withValue(['array'])
                                        .withPath(['properties', 'first', 'type'])
                                ])
                                .withSourceOrigins([
                                    diffResultOriginsBuilder
                                        .withValue(['string'])
                                        .withPath(['properties', 'first', 'type'])
                                ])
                                .build()
                        },
                        required: ['name'],
                        type: ['object']
                    })
                    .withDestinationOrigins([
                        diffResultOriginsBuilder
                            .withValue('object')
                            .withPath(['type']),
                        diffResultOriginsBuilder
                            .withValue(['name', 'first'])
                            .withPath(['required'])
                    ])
                    .withSourceOrigins([
                        diffResultOriginsBuilder
                            .withValue('object')
                            .withPath(['type']),
                        diffResultOriginsBuilder
                            .withValue(['name'])
                            .withPath(['required'])
                    ]).build();
                expect(diffResult.addedJsonSchema).toEqual(allObjectsWithPropertyNameAndPropertyFirstOfTypeArray);
                expect(diffResult.removedJsonSchema)
                    .toEqual(allObjectsWithPropertyNameAndOptionalPropertyFirstOfTypeString);
            });
        });
    });

    describe('references', () => {
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

            const allObjectsWithPropertyIdOfTypeNumber = diffJsonSchemaBuilder
                .withSchema({
                    additionalProperties: allTypesSchema,
                    properties: {
                        id: diffJsonSchemaBuilder
                            .withSchema({type: ['number']})
                            .withSourceOrigins([
                                diffResultOriginsBuilder
                                    .withValue('string')
                                    .withPath(['properties', 'id', 'type'])
                            ])
                            .withDestinationOrigins([
                                diffResultOriginsBuilder
                                    .withValue('number')
                                    .withPath(['properties', 'id', 'type'])
                            ])
                            .build()
                    },
                    required: ['id'],
                    type: ['object']
                })
                .build();
            const allObjectsWithPropertyIdOfTypeString = diffJsonSchemaBuilder
                .withSchema({
                    additionalProperties: allTypesSchema,
                    properties: {
                        id: diffJsonSchemaBuilder
                            .withSchema({type: ['string']})
                            .withSourceOrigins([
                                diffResultOriginsBuilder
                                    .withValue('string')
                                    .withPath(['properties', 'id', 'type'])
                            ])
                            .withDestinationOrigins([
                                diffResultOriginsBuilder
                                    .withValue('number')
                                    .withPath(['properties', 'id', 'type'])
                            ])
                            .build()
                    },
                    required: ['id'],
                    type: ['object']
                })
                .build();
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

            const allObjectsWithPropertyIdOfTypeNumber = diffJsonSchemaBuilder
                .withSchema({
                    additionalProperties: allTypesSchema,
                    properties: {
                        id: diffJsonSchemaBuilder
                            .withSchema({type: ['number']})
                            .withSourceOrigins([
                                diffResultOriginsBuilder
                                    .withValue('string')
                                    .withPath(['properties', 'id', 'type'])
                            ])
                            .withDestinationOrigins([
                                diffResultOriginsBuilder
                                    .withValue('number')
                                    .withPath(['properties', 'id', 'type'])
                            ])
                            .build()
                    },
                    required: ['id'],
                    type: ['object']
                })
                .build();
            const allObjectsWithPropertyIdOfTypeString = diffJsonSchemaBuilder
                .withSchema({
                    additionalProperties: allTypesSchema,
                    properties: {
                        id: diffJsonSchemaBuilder
                            .withSchema({type: ['string']})
                            .withSourceOrigins([
                                diffResultOriginsBuilder
                                    .withValue('string')
                                    .withPath(['properties', 'id', 'type'])
                            ])
                            .withDestinationOrigins([
                                diffResultOriginsBuilder
                                    .withValue('number')
                                    .withPath(['properties', 'id', 'type'])
                            ])
                            .build()
                    },
                    required: ['id'],
                    type: ['object']
                })
                .build();
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

            const allObjectsWithPropertyContentOfTypeString = diffJsonSchemaBuilder
                .withSchema({
                    additionalProperties: allTypesSchema,
                    properties: {
                        id: {
                            additionalProperties: allTypesSchema,
                            properties: {
                                content: diffJsonSchemaBuilder
                                    .withSchema({type: ['number']})
                                    .withSourceOrigins([
                                        diffResultOriginsBuilder
                                            .withValue('string')
                                            .withPath(['properties', 'id', 'properties', 'content', 'type'])
                                    ])
                                    .withDestinationOrigins([
                                        diffResultOriginsBuilder
                                            .withValue('number')
                                            .withPath(['properties', 'id', 'properties', 'content', 'type'])
                                    ])
                                    .build()
                            },
                            required: ['content'],
                            type: ['object']
                        }
                    },
                    required: ['id'],
                    type: ['object']
                })
                .build();
            const allObjectsWithPropertyContentOfTypeNumber = diffJsonSchemaBuilder
                .withSchema({
                    additionalProperties: allTypesSchema,
                    properties: {
                        id: {
                            additionalProperties: allTypesSchema,
                            properties: {
                                content: diffJsonSchemaBuilder
                                    .withSchema({type: ['string']})
                                    .withSourceOrigins([
                                        diffResultOriginsBuilder
                                            .withValue('string')
                                            .withPath(['properties', 'id', 'properties', 'content', 'type'])
                                    ])
                                    .withDestinationOrigins([
                                        diffResultOriginsBuilder
                                            .withValue('number')
                                            .withPath(['properties', 'id', 'properties', 'content', 'type'])
                                    ])
                                    .build()
                            },
                            required: ['content'],
                            type: ['object']
                        }
                    },
                    required: ['id'],
                    type: ['object']
                })
                .build();
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
});
