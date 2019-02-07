"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const type_set_1 = require("../json-set/json-subset/type-set");
const is_type_supported_1 = require("./is-type-supported");
exports.createTypeSet = (setType, parsedSchemaKeywords) => is_type_supported_1.isTypeSupported(parsedSchemaKeywords.type, setType)
    ? new type_set_1.AllTypeSet(setType, parsedSchemaKeywords.type.origins)
    : new type_set_1.EmptyTypeSet(setType, parsedSchemaKeywords.type.origins);
exports.allTypeSetFromJsonSet = (setType, jsonSet) => {
    return new type_set_1.AllTypeSet(setType, jsonSet.schemaOrigins);
};
