"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const create_object_set_1 = require("../set-factories/create-object-set");
const create_type_set_1 = require("../set-factories/create-type-set");
const diff_json_schema_1 = require("./diff-json-schema");
const sanitize_core_diff_json_schema_1 = require("./sanitize-core-diff-json-schema");
const set_1 = require("./set");
class AllJsonSet {
    constructor(schemaOrigins) {
        this.schemaOrigins = schemaOrigins;
        this.setType = 'json';
        this.type = 'all';
    }
    toAll() {
        return this;
    }
    toEmpty() {
        return new EmptyJsonSet(this.schemaOrigins);
    }
    complement() {
        // TODO: can't be properly asserted without keywords support
        return new EmptyJsonSet(this.schemaOrigins);
    }
    intersect(other) {
        return other.intersectWithAll(this);
    }
    intersectWithAll(other) {
        // TODO: mergedSchemaOrigins can't be properly asserted without keywords support
        return new AllJsonSet(this.schemaOrigins.concat(other.schemaOrigins));
    }
    intersectWithEmpty(other) {
        return new EmptyJsonSet(this.schemaOrigins.concat(other.schemaOrigins));
    }
    intersectWithSome(other) {
        return new SomeJsonSet({
            array: other.typeSets.array.intersect(create_type_set_1.allTypeSetFromJsonSet('array', this)),
            boolean: other.typeSets.boolean.intersect(create_type_set_1.allTypeSetFromJsonSet('boolean', this)),
            integer: other.typeSets.integer.intersect(create_type_set_1.allTypeSetFromJsonSet('integer', this)),
            null: other.typeSets.null.intersect(create_type_set_1.allTypeSetFromJsonSet('null', this)),
            number: other.typeSets.number.intersect(create_type_set_1.allTypeSetFromJsonSet('number', this)),
            object: other.typeSets.object.intersect(create_object_set_1.allObjectSetFromJsonSet(this)),
            string: other.typeSets.string.intersect(create_type_set_1.allTypeSetFromJsonSet('string', this))
        });
    }
    toJsonSchema() {
        return sanitize_core_diff_json_schema_1.sanitizeCoreDiffJsonSchema({
            'type': set_1.allSchemaTypes,
            'x-destination-origins': set_1.toDestinationOriginValues(this.schemaOrigins),
            'x-source-origins': set_1.toSourceOriginValues(this.schemaOrigins)
        });
    }
}
exports.AllJsonSet = AllJsonSet;
class EmptyJsonSet {
    constructor(schemaOrigins) {
        this.schemaOrigins = schemaOrigins;
        this.setType = 'json';
        this.type = 'empty';
    }
    toAll() {
        return new AllJsonSet(this.schemaOrigins);
    }
    toEmpty() {
        return this;
    }
    complement() {
        return new AllJsonSet(this.schemaOrigins);
    }
    intersect(other) {
        return other.intersectWithEmpty(this);
    }
    intersectWithEmpty(other) {
        // TODO: can't be properly asserted without keywords support, e.g. {allOf: [false, false]} -> true
        return new EmptyJsonSet(this.schemaOrigins.concat(other.schemaOrigins));
    }
    intersectWithAll(other) {
        return new EmptyJsonSet(this.schemaOrigins.concat(other.schemaOrigins));
    }
    intersectWithSome(other) {
        return new EmptyJsonSet(this.schemaOrigins.concat(other.schemaOrigins));
    }
    toJsonSchema() {
        return false;
    }
}
exports.EmptyJsonSet = EmptyJsonSet;
class SomeJsonSet {
    constructor(typeSets) {
        this.typeSets = typeSets;
        this.setType = 'json';
    }
    static createEmptyCoreDiffJsonSchema() {
        return {
            type: []
        };
    }
    static mergeCoreDiffJsonSchemas(schema, otherSchema) {
        const schemaTypes = SomeJsonSet.getJsonSchemaTypeOrEmpty(schema);
        const otherSchemaTypes = SomeJsonSet.getJsonSchemaTypeOrEmpty(otherSchema);
        const type = schemaTypes.concat(otherSchemaTypes);
        const sourceOrigins = this.mergeOrigins(schema['x-source-origins'], otherSchema['x-source-origins']);
        const destinationOrigins = this.mergeOrigins(schema['x-destination-origins'], otherSchema['x-destination-origins']);
        const mergedSchema = Object.assign({}, schema, otherSchema, { type, 'x-destination-origins': destinationOrigins, 'x-source-origins': sourceOrigins });
        return mergedSchema;
    }
    static mergeOrigins(originsA = [], originsB = []) {
        const mergedOrigins = [...originsA, ...originsB];
        return _.uniqWith(mergedOrigins, _.isEqual);
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
    static toCoreDiffJsonSchema(schema) {
        return diff_json_schema_1.isCoreDiffJsonSchema(schema)
            ? schema
            : SomeJsonSet.createEmptyCoreDiffJsonSchema();
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
    toAll() {
        return new AllJsonSet(this.schemaOrigins);
    }
    toEmpty() {
        return new EmptyJsonSet(this.schemaOrigins);
    }
    get schemaOrigins() {
        return Object.keys(this.typeSets).reduce((allOrigins, typeSetName) => allOrigins.concat(this.typeSets[typeSetName].schemaOrigins), []);
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
    intersectWithAll(other) {
        return new SomeJsonSet({
            array: this.typeSets.array.intersect(create_type_set_1.allTypeSetFromJsonSet('array', other)),
            boolean: this.typeSets.boolean.intersect(create_type_set_1.allTypeSetFromJsonSet('boolean', other)),
            integer: this.typeSets.integer.intersect(create_type_set_1.allTypeSetFromJsonSet('integer', other)),
            null: this.typeSets.null.intersect(create_type_set_1.allTypeSetFromJsonSet('null', other)),
            number: this.typeSets.number.intersect(create_type_set_1.allTypeSetFromJsonSet('number', other)),
            object: this.typeSets.object.intersect(create_object_set_1.allObjectSetFromJsonSet(other)),
            string: this.typeSets.string.intersect(create_type_set_1.allTypeSetFromJsonSet('string', other))
        });
    }
    intersectWithEmpty(other) {
        return new EmptyJsonSet(this.schemaOrigins.concat(other.schemaOrigins));
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
            .map((typeSetName) => this.getSubsetSchemaAsCoreDiffJsonSchema(typeSetName));
        const isSimpleSchema = (schema) => !schema.anyOf || schema.anyOf.length <= 1;
        const mergedSimpleSubsetSchemas = typeSetSchemas
            .filter(isSimpleSchema)
            .map((schema) => {
            if (schema.anyOf) {
                return SomeJsonSet.toCoreDiffJsonSchema(schema.anyOf[0]);
            }
            return schema;
        })
            .reduce((mergedSchema, schema) => {
            return SomeJsonSet.mergeCoreDiffJsonSchemas(mergedSchema, schema);
        }, SomeJsonSet.createEmptyCoreDiffJsonSchema());
        const mergedComplexSubsetSchemas = typeSetSchemas
            .filter((schema) => !isSimpleSchema(schema))
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
        const sanitisedResult = sanitize_core_diff_json_schema_1.sanitizeCoreDiffJsonSchema(result);
        return SomeJsonSet.toDiffJsonSchema(sanitisedResult);
    }
    getSubsetSchemaAsCoreDiffJsonSchema(typeSetName) {
        const typeSetSchema = this.typeSets[typeSetName].toJsonSchema();
        return SomeJsonSet.toCoreDiffJsonSchema(typeSetSchema);
    }
    areAllTypeSetsOfType(setType) {
        return Object
            .keys(this.typeSets)
            .every((name) => this.typeSets[name].type === setType);
    }
}
exports.SomeJsonSet = SomeJsonSet;
