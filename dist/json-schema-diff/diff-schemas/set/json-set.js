"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const omit_defaults_1 = require("./json-set/omit-defaults");
const set_1 = require("./set");
class AllJsonSet {
    constructor() {
        this.setType = 'json';
        this.type = 'all';
    }
    complement() {
        return exports.emptyJsonSet;
    }
    intersect(other) {
        return other;
    }
    intersectWithSome(other) {
        return other;
    }
    toJsonSchema() {
        return true;
    }
}
exports.AllJsonSet = AllJsonSet;
exports.allJsonSet = new AllJsonSet();
class EmptyJsonSet {
    constructor() {
        this.setType = 'json';
        this.type = 'empty';
    }
    complement() {
        return exports.allJsonSet;
    }
    intersect() {
        return this;
    }
    intersectWithSome() {
        return this;
    }
    toJsonSchema() {
        return false;
    }
}
exports.EmptyJsonSet = EmptyJsonSet;
exports.emptyJsonSet = new EmptyJsonSet();
class SomeJsonSet {
    constructor(typeSets) {
        this.typeSets = typeSets;
        this.setType = 'json';
    }
    static isSimpleSchema(schema) {
        return !schema.anyOf || schema.anyOf.length <= 1;
    }
    static createEmptyCoreRepresentationJsonSchema() {
        return {
            type: []
        };
    }
    static mergeCoreRepresentationJsonSchemas(schema, otherSchema) {
        const schemaTypes = SomeJsonSet.getJsonSchemaTypeOrEmpty(schema);
        const otherSchemaTypes = SomeJsonSet.getJsonSchemaTypeOrEmpty(otherSchema);
        const type = schemaTypes.concat(otherSchemaTypes);
        return Object.assign({}, schema, otherSchema, { type });
    }
    static toDiffJsonSchema(jsonSchema) {
        const jsonSchemaTypes = SomeJsonSet.getJsonSchemaTypeOrEmpty(jsonSchema);
        const jsonSchemaAnyOf = SomeJsonSet.getJsonSchemaAnyOfOrEmpty(jsonSchema);
        const isEmpty = jsonSchemaTypes.length === 0 && jsonSchemaAnyOf.length === 0;
        return isEmpty ? false : jsonSchema;
    }
    static getJsonSchemaTypeOrEmpty(jsonSchema) {
        return jsonSchema.type || [];
    }
    static getJsonSchemaAnyOfOrEmpty(jsonSchema) {
        return jsonSchema.anyOf || [];
    }
    static toCoreRepresentationJsonSchema(schema) {
        return set_1.isCoreRepresentationJsonSchema(schema)
            ? schema
            : SomeJsonSet.createEmptyCoreRepresentationJsonSchema();
    }
    get type() {
        if (this.areAllTypeSetsOfType('empty')) {
            return 'empty';
        }
        if (this.areAllTypeSetsOfType('all')) {
            return 'all';
        }
        return 'some';
    }
    complement() {
        return new SomeJsonSet({
            array: this.typeSets.array.complement(),
            boolean: this.typeSets.boolean.complement(),
            integer: this.typeSets.integer.complement(),
            null: this.typeSets.null.complement(),
            number: this.typeSets.number.complement(),
            object: this.typeSets.object.complement(),
            string: this.typeSets.string.complement()
        });
    }
    intersect(other) {
        return other.intersectWithSome(this);
    }
    intersectWithSome(other) {
        return new SomeJsonSet({
            array: this.typeSets.array.intersect(other.typeSets.array),
            boolean: this.typeSets.boolean.intersect(other.typeSets.boolean),
            integer: this.typeSets.integer.intersect(other.typeSets.integer),
            null: this.typeSets.null.intersect(other.typeSets.null),
            number: this.typeSets.number.intersect(other.typeSets.number),
            object: this.typeSets.object.intersect(other.typeSets.object),
            string: this.typeSets.string.intersect(other.typeSets.string)
        });
    }
    toJsonSchema() {
        const typeSetSchemas = Object
            .keys(this.typeSets)
            .map((typeSetName) => this.getSubsetAsCoreRepresentationJsonSchema(typeSetName));
        const mergedSimpleSubsetSchemas = typeSetSchemas
            .filter(SomeJsonSet.isSimpleSchema)
            .map((schema) => {
            if (schema.anyOf) {
                return SomeJsonSet.toCoreRepresentationJsonSchema(schema.anyOf[0]);
            }
            return schema;
        })
            .reduce((mergedSchema, schema) => {
            return SomeJsonSet.mergeCoreRepresentationJsonSchemas(mergedSchema, schema);
        }, SomeJsonSet.createEmptyCoreRepresentationJsonSchema());
        const mergedComplexSubsetSchemas = typeSetSchemas
            .filter((schema) => !SomeJsonSet.isSimpleSchema(schema))
            .reduce((mergedSchema, schema) => {
            const mergedSchemaAnyOf = SomeJsonSet.getJsonSchemaAnyOfOrEmpty(mergedSchema);
            const schemaAnyOf = SomeJsonSet.getJsonSchemaAnyOfOrEmpty(schema);
            return {
                anyOf: mergedSchemaAnyOf.concat(schemaAnyOf)
            };
        }, {});
        let result;
        if (SomeJsonSet.getJsonSchemaAnyOfOrEmpty(mergedComplexSubsetSchemas).length === 0) {
            result = mergedSimpleSubsetSchemas;
        }
        else if (SomeJsonSet.getJsonSchemaTypeOrEmpty(mergedSimpleSubsetSchemas).length === 0) {
            result = mergedComplexSubsetSchemas;
        }
        else {
            const mergedAnyOf = SomeJsonSet.getJsonSchemaAnyOfOrEmpty(mergedComplexSubsetSchemas);
            mergedAnyOf.push(mergedSimpleSubsetSchemas);
            result = mergedComplexSubsetSchemas;
        }
        const sanitisedResult = omit_defaults_1.omitDefaults(result);
        return SomeJsonSet.toDiffJsonSchema(sanitisedResult);
    }
    getSubsetAsCoreRepresentationJsonSchema(typeSetName) {
        const typeSetSchema = this.typeSets[typeSetName].toJsonSchema();
        return SomeJsonSet.toCoreRepresentationJsonSchema(typeSetSchema);
    }
    areAllTypeSetsOfType(setType) {
        return Object
            .keys(this.typeSets)
            .every((name) => this.typeSets[name].type === setType);
    }
}
exports.SomeJsonSet = SomeJsonSet;
