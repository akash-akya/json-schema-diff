"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const isItemsAndMinItemsContradiction = (config) => {
    const itemsAcceptsNoValues = config.items.type === 'empty';
    const minItemsRequiresValues = config.minItems > 0;
    return itemsAcceptsNoValues && minItemsRequiresValues;
};
const isMaxItemsAndMinItemsContradiction = (config) => {
    return config.minItems > config.maxItems;
};
const isMinItemsContradiction = (config) => {
    return config.minItems === Infinity;
};
exports.arraySubsetConfigHasContradictions = (config) => {
    return isItemsAndMinItemsContradiction(config)
        || isMaxItemsAndMinItemsContradiction(config)
        || isMinItemsContradiction(config);
};
