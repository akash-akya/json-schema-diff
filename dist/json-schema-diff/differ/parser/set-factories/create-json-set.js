"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const json_set_1 = require("../json-set/json-set");
const create_object_set_1 = require("./create-object-set");
const create_type_set_1 = require("./create-type-set");
exports.createJsonSet = (parsedSchemaKeywords) => {
    const typeSets = {
        array: create_type_set_1.createTypeSet('array', parsedSchemaKeywords),
        boolean: create_type_set_1.createTypeSet('boolean', parsedSchemaKeywords),
        integer: create_type_set_1.createTypeSet('integer', parsedSchemaKeywords),
        null: create_type_set_1.createTypeSet('null', parsedSchemaKeywords),
        number: create_type_set_1.createTypeSet('number', parsedSchemaKeywords),
        object: create_object_set_1.createObjectSet(parsedSchemaKeywords),
        string: create_type_set_1.createTypeSet('string', parsedSchemaKeywords)
    };
    return new json_set_1.SomeJsonSet(typeSets);
};
exports.createAllJsonSet = (schemaOrigins) => {
    return new json_set_1.AllJsonSet(schemaOrigins);
};
exports.createEmptyJsonSet = (schemaOrigins) => {
    return new json_set_1.EmptyJsonSet(schemaOrigins);
};
