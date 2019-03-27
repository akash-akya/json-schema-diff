"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const intersectMaxItems = (configA, configB) => Math.min(configA.maxItems, configB.maxItems);
const intersectMinItems = (configA, configB) => Math.max(configA.minItems, configB.minItems);
exports.intersectArraySubsetConfig = (configA, configB) => ({
    items: configA.items.intersect(configB.items),
    maxItems: intersectMaxItems(configA, configB),
    minItems: intersectMinItems(configA, configB)
});
