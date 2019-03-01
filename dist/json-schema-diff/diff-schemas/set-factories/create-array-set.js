"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const set_of_subsets_1 = require("../set/set-of-subsets");
const array_subset_1 = require("../set/subset/array-subset");
const is_type_supported_1 = require("./is-type-supported");
const supportsAllArrays = (arraySetParsedKeywords) => arraySetParsedKeywords.items.type === 'all' && arraySetParsedKeywords.minItems === 0;
const createArraySubset = (arraySetParsedKeywords) => {
    if (!is_type_supported_1.isTypeSupported(arraySetParsedKeywords.type, 'array')) {
        return array_subset_1.emptyArraySubset;
    }
    if (supportsAllArrays(arraySetParsedKeywords)) {
        return array_subset_1.allArraySubset;
    }
    return array_subset_1.createArraySubsetFromConfig(arraySetParsedKeywords);
};
exports.createArraySet = (arraySetParsedKeywords) => {
    const arraySubset = createArraySubset(arraySetParsedKeywords);
    return new set_of_subsets_1.SetOfSubsets('array', [arraySubset]);
};
