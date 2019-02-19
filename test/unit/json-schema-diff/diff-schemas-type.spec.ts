import {JsonSchema} from 'json-schema-spec-types';
import {invokeDiff} from '../support/invoke-diff';

describe('diff-schemas type', () => {
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
