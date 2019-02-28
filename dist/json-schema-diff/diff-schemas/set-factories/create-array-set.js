"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const array_set_1 = require("../set/array-set");
const is_type_supported_1 = require("./is-type-supported");
const supportsAllArrays = (arraySetParsedKeywords) => {
    // TODO: This should look at the minItems keyword, but we need minItems support to do that
    return arraySetParsedKeywords.items.type === 'all';
};
exports.createArraySet = (arraySetParsedKeywords) => {
    if (!is_type_supported_1.isTypeSupported(arraySetParsedKeywords.type, 'array')) {
        return array_set_1.emptyArraySet;
    }
    if (supportsAllArrays(arraySetParsedKeywords)) {
        return array_set_1.allArraySet;
    }
    // TODO: Make this invoke createArraySetFromConfig, but can't be asserted, needs support:
    //  {minItems: 1, type: 'array', items: false} -> false
    return new array_set_1.SomeArraySet(arraySetParsedKeywords);
};
