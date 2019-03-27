"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const json_set_1 = require("../../json-set");
const keyword_defaults_1 = require("../../keyword-defaults");
const complementItems = (config) => ({
    items: config.items.complement(),
    maxItems: keyword_defaults_1.defaultMaxItems,
    minItems: 1
});
const complementMinItems = (config) => ({
    items: json_set_1.allJsonSet,
    maxItems: config.minItems - 1,
    minItems: keyword_defaults_1.defaultMinItems
});
const complementMaxItems = (config) => ({
    items: json_set_1.allJsonSet,
    maxItems: keyword_defaults_1.defaultMaxItems,
    minItems: config.maxItems + 1
});
exports.complementArraySubsetConfig = (config) => {
    const complementedItems = complementItems(config);
    const complementedMinItems = complementMinItems(config);
    const complementedMaxItems = complementMaxItems(config);
    return [complementedItems, complementedMinItems, complementedMaxItems];
};
