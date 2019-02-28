"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const json_set_1 = require("../set/json-set");
const create_array_set_1 = require("./create-array-set");
const create_object_set_1 = require("./create-object-set");
const create_type_set_1 = require("./create-type-set");
exports.createSomeJsonSet = (parsedSchemaKeywords) => {
    const typeSets = {
        array: create_array_set_1.createArraySet(parsedSchemaKeywords),
        boolean: create_type_set_1.createTypeSet('boolean', parsedSchemaKeywords.type),
        integer: create_type_set_1.createTypeSet('integer', parsedSchemaKeywords.type),
        null: create_type_set_1.createTypeSet('null', parsedSchemaKeywords.type),
        number: create_type_set_1.createTypeSet('number', parsedSchemaKeywords.type),
        object: create_object_set_1.createObjectSet(parsedSchemaKeywords),
        string: create_type_set_1.createTypeSet('string', parsedSchemaKeywords.type)
    };
    return new json_set_1.SomeJsonSet(typeSets);
};
exports.createAllJsonSet = () => {
    return json_set_1.allJsonSet;
};
exports.createEmptyJsonSet = () => {
    return json_set_1.emptyJsonSet;
};
