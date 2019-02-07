import {JsonSchema, SimpleTypes} from 'json-schema-spec-types';
import {CoreDiffJsonSchema} from '../../../lib/json-schema-diff/differ/parser/json-set/diff-json-schema';
import {invokeDiff, invokeDiffAndExpectToFail} from '../support/invoke-diff';

export const allTypes: CoreDiffJsonSchema = {
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

            const allNumbers: JsonSchema = {type: ['number']};
            expect(diffResult.addedJsonSchema).toEqual(false);
            expect(diffResult.removedJsonSchema).toEqual(allNumbers);
        });

        it('should find an add type difference when an array is added', async () => {
            const sourceSchema: JsonSchema = {type: 'number'};
            const destinationsSchema: JsonSchema = {type: ['number', 'array']};

            const diffResult = await invokeDiff(sourceSchema, destinationsSchema);

            const allArrays: JsonSchema = {type: ['array']};
            expect(diffResult.addedJsonSchema).toEqual(allArrays);
            expect(diffResult.removedJsonSchema).toEqual(false);
        });

        it('should find an add type difference when a boolean is added', async () => {
            const sourceSchema: JsonSchema = {type: 'number'};
            const destinationsSchema: JsonSchema = {type: ['number', 'boolean']};

            const diffResult = await invokeDiff(sourceSchema, destinationsSchema);

            const allBooleans: JsonSchema = {type: ['boolean']};
            expect(diffResult.addedJsonSchema).toEqual(allBooleans);
            expect(diffResult.removedJsonSchema).toEqual(false);
        });

        it('should find an add type difference when an integer is added', async () => {
            const sourceSchema: JsonSchema = {type: 'number'};
            const destinationsSchema: JsonSchema = {type: ['number', 'integer']};

            const diffResult = await invokeDiff(sourceSchema, destinationsSchema);

            const allIntegers: JsonSchema = {type: ['integer']};
            expect(diffResult.addedJsonSchema).toEqual(allIntegers);
            expect(diffResult.removedJsonSchema).toEqual(false);
        });

        it('should find an add type difference when a null is added', async () => {
            const sourceSchema: JsonSchema = {type: 'number'};
            const destinationsSchema: JsonSchema = {type: ['number', 'null']};

            const diffResult = await invokeDiff(sourceSchema, destinationsSchema);

            const allNulls: JsonSchema = {type: ['null']};
            expect(diffResult.addedJsonSchema).toEqual(allNulls);
            expect(diffResult.removedJsonSchema).toEqual(false);
        });

        it('should find an add type difference when a number is added', async () => {
            const sourceSchema: JsonSchema = {type: 'string'};
            const destinationsSchema: JsonSchema = {type: ['string', 'number']};

            const diffResult = await invokeDiff(sourceSchema, destinationsSchema);

            const allNumbers: JsonSchema = {type: ['number']};
            expect(diffResult.addedJsonSchema).toEqual(allNumbers);
            expect(diffResult.removedJsonSchema).toEqual(false);
        });

        it('should find an add type difference when an object is added', async () => {
            const sourceSchema: JsonSchema = {type: 'number'};
            const destinationsSchema: JsonSchema = {type: ['number', 'object']};

            const diffResult = await invokeDiff(sourceSchema, destinationsSchema);

            const allObjects: JsonSchema = {type: ['object']};
            expect(diffResult.addedJsonSchema).toEqual(allObjects);
            expect(diffResult.removedJsonSchema).toEqual(false);
        });

        it('should find an add type difference when a string is added', async () => {
            const sourceSchema: JsonSchema = {type: 'number'};
            const destinationsSchema: JsonSchema = {type: ['number', 'string']};

            const diffResult = await invokeDiff(sourceSchema, destinationsSchema);

            const allStrings: JsonSchema = {type: ['string']};
            expect(diffResult.addedJsonSchema).toEqual(allStrings);
            expect(diffResult.removedJsonSchema).toEqual(false);
        });

        it('should find an add and remove difference when a type is changed ', async () => {
            const sourceSchema: JsonSchema = {type: 'number'};
            const destinationsSchema: JsonSchema = {type: 'string'};

            const diffResult = await invokeDiff(sourceSchema, destinationsSchema);

            const allStrings: JsonSchema = {type: ['string']};
            const allNumbers: JsonSchema = {type: ['number']};
            expect(diffResult.addedJsonSchema).toEqual(allStrings);
            expect(diffResult.removedJsonSchema).toEqual(allNumbers);
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

            const allBooleansAndStrings: JsonSchema = {type: ['boolean', 'string']};
            expect(diffResult.addedJsonSchema).toEqual(false);
            expect(diffResult.removedJsonSchema).toEqual(allBooleansAndStrings);
        });

        it('should find multiple differences when multiple types are added', async () => {
            const sourceSchema: JsonSchema = {type: ['number']};
            const destinationsSchema: JsonSchema = {type: ['number', 'string', 'boolean']};

            const diffResult = await invokeDiff(sourceSchema, destinationsSchema);

            const allBooleansAndStrings: JsonSchema = {type: ['boolean', 'string']};
            expect(diffResult.addedJsonSchema).toEqual(allBooleansAndStrings);
            expect(diffResult.removedJsonSchema).toEqual(false);
        });

        it('should find removed differences when there was no type and now there is', async () => {
            const sourceSchema: JsonSchema = {};
            const destinationsSchema: JsonSchema = {type: ['integer', 'number', 'object', 'null', 'boolean', 'array']};

            const diffResult = await invokeDiff(sourceSchema, destinationsSchema);

            const allStrings: JsonSchema = {type: ['string']};
            expect(diffResult.addedJsonSchema).toEqual(false);
            expect(diffResult.removedJsonSchema).toEqual(allStrings);
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

            const allObjectsWithAtLeastOneStringProperty: JsonSchema = {
                additionalProperties: {type: ['string']},
                minProperties: 1,
                type: ['object']
            };
            expect(diffResult.addedJsonSchema).toEqual(false);
            expect(diffResult.removedJsonSchema).toEqual(allObjectsWithAtLeastOneStringProperty);
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

            const allObjectsWithRequiredNumberId: JsonSchema = {
                additionalProperties: allTypes,
                properties: {
                    id: {type: ['number']}
                },
                required: ['id'],
                type: ['object']
            };
            const allObjectsWithRequiredStringId: JsonSchema = {
                additionalProperties: allTypes,
                properties: {
                    id: {type: ['string']}
                },
                required: ['id'],
                type: ['object']
            };
            expect(diffResult.addedJsonSchema).toEqual(allObjectsWithRequiredNumberId);
            expect(diffResult.removedJsonSchema).toEqual(allObjectsWithRequiredStringId);
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

            const allObjectsWithRequiredNumberId: JsonSchema = {
                additionalProperties: allTypes,
                properties: {
                    id: {type: ['number']}
                },
                required: ['id'],
                type: ['object']
            };
            const allObjectsWithRequiredStringId: JsonSchema = {
                additionalProperties: allTypes,
                properties: {
                    id: {type: ['string']}
                },
                required: ['id'],
                type: ['object']
            };
            expect(diffResult.addedJsonSchema).toEqual(allObjectsWithRequiredNumberId);
            expect(diffResult.removedJsonSchema).toEqual(allObjectsWithRequiredStringId);
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

            const allObjectsWithRequiredObjectIdContainingRequiredNumberContent: JsonSchema = {
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
            const allObjectsWithRequiredObjectIdContainingRequiredStringContent: JsonSchema = {
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
            expect(diffResult.addedJsonSchema).toEqual(allObjectsWithRequiredObjectIdContainingRequiredNumberContent);
            expect(diffResult.removedJsonSchema).toEqual(allObjectsWithRequiredObjectIdContainingRequiredStringContent);
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
