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
exports.arrayHasContradictions = (config) => {
    return isItemsAndMinItemsContradiction(config) || isMaxItemsAndMinItemsContradiction(config);
};
